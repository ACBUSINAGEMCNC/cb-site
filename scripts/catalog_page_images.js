const fs = require("fs/promises");
const fssync = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// pdfjs + canvas (pdfjs-dist@4 usa módulos .mjs)
const { createCanvas, DOMMatrix, ImageData, Path2D } = require("@napi-rs/canvas");

// Polyfills necessários para o pdfjs renderizar no Node
if (typeof globalThis.DOMMatrix === "undefined" && DOMMatrix) {
  globalThis.DOMMatrix = DOMMatrix;
}
if (typeof globalThis.ImageData === "undefined" && ImageData) {
  globalThis.ImageData = ImageData;
}
if (typeof globalThis.Path2D === "undefined" && Path2D) {
  globalThis.Path2D = Path2D;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function isCode(line) {
  return /^[A-Z]{1,5}\d{2,10}$/.test(line);
}

function isPageMarker(line) {
  return /^PAG\s*\d+/i.test(line);
}

function extractPageNumber(line) {
  const m = line.match(/\d+/);
  return m ? Number(m[0]) : null;
}

async function extractTextWithPagerender(pdfPath) {
  const dataBuffer = fssync.readFileSync(pdfPath);
  const pagerender = (pageData) => {
    return pageData.getTextContent().then((textContent) => {
      let lastY;
      let text = "";
      for (const item of textContent.items) {
        const str = (item.str || "").trim();
        if (!str) continue;
        if (lastY === item.transform[5] || lastY === undefined) {
          text += str + " ";
        } else {
          text += "\n" + str + " ";
        }
        lastY = item.transform[5];
      }
      return text + "\n";
    });
  };

  const data = await pdf(dataBuffer, { pagerender });
  return (data.text || "").trim();
}

function buildCodeToPageMap(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  let currentPage = null;
  const map = new Map();

  for (const line of lines) {
    if (isPageMarker(line)) {
      const p = extractPageNumber(line);
      if (p) currentPage = p;
      continue;
    }

    if (isCode(line) && currentPage) {
      const code = line.toUpperCase();
      if (!map.has(code)) map.set(code, currentPage);
    }
  }

  return map;
}

async function renderPageToPng(pdfPath, pageNumber, outFile, scale = 2) {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // No Node, evitamos worker (resolve erro de GlobalWorkerOptions.workerSrc)
  const loadingTask = pdfjsLib.getDocument({
    url: pdfPath,
    disableWorker: true,
  });
  const doc = await loadingTask.promise;

  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");

  await page.render({ canvasContext: context, viewport }).promise;

  const pngBuffer = canvas.toBuffer("image/png");
  await fs.writeFile(outFile, pngBuffer);
}

async function main() {
  const pdfPath = path.resolve(
    __dirname,
    "..",
    "..",
    "UPLOADS",
    "Art Company - Catalogo (Completo).pdf"
  );

  const outDir = path.resolve(process.cwd(), "public", "catalog-pages");
  await fs.mkdir(outDir, { recursive: true });

  console.log("Lendo PDF para mapear códigos -> páginas...");
  const text = await extractTextWithPagerender(pdfPath);
  const codeToPage = buildCodeToPageMap(text);

  console.log("Códigos mapeados para página:", codeToPage.size);

  // Buscar produtos no banco
  const products = await prisma.product.findMany({
    select: { id: true, internalCode: true },
  });

  const neededPages = new Set();
  const productPage = new Map();

  for (const p of products) {
    const code = (p.internalCode || "").toUpperCase();
    const pageNum = codeToPage.get(code);
    if (!pageNum) continue;
    neededPages.add(pageNum);
    productPage.set(p.id, pageNum);
  }

  console.log("Páginas necessárias:", [...neededPages].sort((a, b) => a - b));

  // Renderizar páginas necessárias (se não existir)
  for (const pageNum of [...neededPages].sort((a, b) => a - b)) {
    const outFile = path.join(outDir, `pag-${pad2(pageNum)}.png`);
    try {
      await fs.access(outFile);
      // já existe
      continue;
    } catch {
      // render
    }

    console.log("Renderizando página", pageNum);
    await renderPageToPng(pdfPath, pageNum, outFile, 2);
  }

  // Para cada produto sem imagem, anexar a imagem da página
  let attached = 0;
  let skippedHasImage = 0;
  let skippedNoPage = 0;

  for (const p of products) {
    const pageNum = productPage.get(p.id);
    if (!pageNum) {
      skippedNoPage += 1;
      continue;
    }

    const existingImages = await prisma.productImage.findMany({
      where: { productId: p.id },
      select: { id: true },
      take: 1,
    });

    if (existingImages.length > 0) {
      skippedHasImage += 1;
      continue;
    }

    const url = `/catalog-pages/pag-${pad2(pageNum)}.png`;

    await prisma.productImage.create({
      data: { productId: p.id, url, isPrimary: true },
    });

    attached += 1;
  }

  console.log({ attached, skippedHasImage, skippedNoPage });
  console.log("Pronto: páginas em /public/catalog-pages e imagens associadas no banco.");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
