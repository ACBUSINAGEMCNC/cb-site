const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function slugify(input) {
  return String(input)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function isCode(line) {
  return /^[A-Z]{1,5}\d{2,10}$/.test(line);
}

function isCategory(line) {
  return /^LINHA\s+/i.test(line);
}

function isPageMarker(line) {
  return /^PAG\s*\d+/i.test(line);
}

async function extractPdfText(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);

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

function parseCatalogText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const results = [];

  let currentCategory = null;
  let currentCode = null;
  let currentNameParts = [];

  function flushCurrent() {
    if (!currentCode) return;
    const name = currentNameParts.join(" ").replace(/\s+/g, " ").trim();
    results.push({
      categoryName: currentCategory || "Sem Categoria",
      code: currentCode,
      name: name || currentCode,
    });
    currentCode = null;
    currentNameParts = [];
  }

  for (const line of lines) {
    if (isCategory(line)) {
      flushCurrent();
      currentCategory = line;
      continue;
    }

    if (isPageMarker(line)) {
      continue;
    }

    if (isCode(line)) {
      flushCurrent();
      currentCode = line;
      continue;
    }

    // ignora textos genéricos
    if (/^industria de pecas agricolas/i.test(line)) continue;
    if (/^artcompany/i.test(line)) continue;

    if (currentCode) {
      currentNameParts.push(line);
    }
  }

  flushCurrent();

  // Dedup por código (primeiro ganha)
  const seen = new Set();
  return results.filter((r) => {
    const key = r.code;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  const pdfPath = path.resolve(
    __dirname,
    "..",
    "..",
    "UPLOADS",
    "Art Company - Catalogo (Completo).pdf"
  );

  console.log("Lendo PDF...", pdfPath);
  const text = await extractPdfText(pdfPath);
  console.log("Texto extraído (tamanho):", text.length);

  const parsed = parseCatalogText(text);
  console.log("Itens encontrados:", parsed.length);

  let createdCategories = 0;
  let createdProducts = 0;
  let updatedProducts = 0;

  const categoryCache = new Map();

  for (const item of parsed) {
    const categoryName = item.categoryName.toUpperCase();
    const categorySlug = slugify(categoryName);

    let category = categoryCache.get(categorySlug);
    if (!category) {
      category = await prisma.category.upsert({
        where: { slug: categorySlug },
        update: { name: categoryName },
        create: { name: categoryName, slug: categorySlug },
      });
      categoryCache.set(categorySlug, category);
      // não dá para saber se foi create/update sem query extra — mas ok
      createdCategories += 1;
    }

    const baseSlug = slugify(item.code);
    let slug = baseSlug;

    // garante slug único
    let suffix = 2;
    while (await prisma.product.findUnique({ where: { slug } })) {
      if (suffix > 20) break;
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const existingByCode = await prisma.product.findFirst({
      where: { internalCode: item.code },
    });

    if (existingByCode) {
      await prisma.product.update({
        where: { id: existingByCode.id },
        data: {
          name: item.name,
          categoryId: category.id,
          application: categoryName,
        },
      });
      updatedProducts += 1;
      continue;
    }

    await prisma.product.create({
      data: {
        name: item.name,
        slug,
        internalCode: item.code,
        application: categoryName,
        categoryId: category.id,
      },
    });
    createdProducts += 1;
  }

  console.log("Import concluído.");
  console.log({ createdCategories, createdProducts, updatedProducts });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
