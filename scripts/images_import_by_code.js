const fs = require("fs/promises");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const VALID_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function normalizeCode(code) {
  return String(code).trim().toUpperCase();
}

function safeFilename(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 120);
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const sourceDir = process.env.SOURCE_DIR
    ? path.resolve(process.env.SOURCE_DIR)
    : path.resolve(process.cwd(), "batch-images");

  const makePrimary = (process.env.MAKE_PRIMARY ?? "true").toLowerCase() === "true";

  console.log("--- IMAGES IMPORT BY CODE ---");
  console.log("Source dir:", sourceDir);
  console.log("Make primary:", makePrimary);

  const entries = await fs.readdir(sourceDir, { withFileTypes: true }).catch(() => []);
  if (entries.length === 0) {
    console.log("Nenhum arquivo encontrado. Coloque imagens em:", sourceDir);
    return;
  }

  let matched = 0;
  let created = 0;
  let skipped = 0;
  let notFound = 0;

  for (const ent of entries) {
    if (!ent.isFile()) continue;

    const ext = path.extname(ent.name).toLowerCase();
    if (!VALID_EXTS.has(ext)) {
      skipped += 1;
      continue;
    }

    const base = path.basename(ent.name, ext);
    const code = normalizeCode(base);

    const product = await prisma.product.findFirst({
      where: { internalCode: code },
      select: { id: true, internalCode: true },
    });

    if (!product) {
      notFound += 1;
      continue;
    }

    matched += 1;

    const srcOnDisk = path.join(sourceDir, ent.name);

    const dirOnDisk = path.join(process.cwd(), "public", "product-images", String(product.id));
    await fs.mkdir(dirOnDisk, { recursive: true });

    const filename = `${Date.now()}-${safeFilename(ent.name)}`;
    const dstOnDisk = path.join(dirOnDisk, filename);

    await fs.copyFile(srcOnDisk, dstOnDisk);

    const url = `/product-images/${product.id}/${filename}`;

    if (makePrimary) {
      await prisma.productImage.updateMany({
        where: { productId: product.id },
        data: { isPrimary: false },
      });
    }

    // evita duplicar se a mesma URL já existir (improvável por timestamp, mas ok)
    const exists = await prisma.productImage.findFirst({
      where: { productId: product.id, url },
      select: { id: true },
    });

    if (!exists) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          isPrimary: makePrimary,
        },
      });
      created += 1;
    }
  }

  console.log({ matched, created, skipped, notFound });

  // dica rápida
  console.log(
    "Dica: nomeie arquivos como CQ69723.png (código exatamente igual ao internalCode)."
  );
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
