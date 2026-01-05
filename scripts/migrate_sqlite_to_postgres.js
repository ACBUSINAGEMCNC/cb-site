const path = require("path");

const { PrismaClient } = require("@prisma/client");

function requireBetterSqlite3() {
  try {
    // eslint-disable-next-line global-require
    return require("better-sqlite3");
  } catch (err) {
    const message =
      "Dependência faltando: better-sqlite3. Instale com: npm i better-sqlite3";
    const e = new Error(message);
    e.cause = err;
    throw e;
  }
}

function asBool(v) {
  return v === 1 || v === true || v === "1";
}

async function main() {
  const sqlitePath =
    process.env.SQLITE_DB_PATH || path.join(process.cwd(), "prisma", "dev.db");

  const BetterSqlite3 = requireBetterSqlite3();
  const db = new BetterSqlite3(sqlitePath, { readonly: true });

  const prisma = new PrismaClient();

  try {
    const categories = db
      .prepare(
        "SELECT id, name, slug, description FROM Category ORDER BY id ASC"
      )
      .all();

    const products = db
      .prepare(
        "SELECT id, name, slug, internalCode, description, application, material, treatment, isHighlighted, categoryId, createdAt, updatedAt FROM Product ORDER BY id ASC"
      )
      .all();

    const images = db
      .prepare(
        "SELECT id, url, isPrimary, productId FROM ProductImage ORDER BY id ASC"
      )
      .all();

    const categoryIdMap = new Map();
    const productIdMap = new Map();

    for (const c of categories) {
      const created = await prisma.category.upsert({
        where: { slug: c.slug },
        create: {
          name: c.name,
          slug: c.slug,
          description: c.description ?? null,
        },
        update: {
          name: c.name,
          description: c.description ?? null,
        },
        select: { id: true, slug: true },
      });

      categoryIdMap.set(c.id, created.id);
    }

    for (const p of products) {
      const mappedCategoryId = categoryIdMap.get(p.categoryId);
      if (!mappedCategoryId) {
        throw new Error(
          `Categoria não encontrada no map para Product id=${p.id} (categoryId=${p.categoryId}).`
        );
      }

      const created = await prisma.product.upsert({
        where: { slug: p.slug },
        create: {
          name: p.name,
          slug: p.slug,
          internalCode: p.internalCode ?? null,
          description: p.description ?? null,
          application: p.application ?? null,
          material: p.material ?? null,
          treatment: p.treatment ?? null,
          isHighlighted: asBool(p.isHighlighted),
          categoryId: mappedCategoryId,
        },
        update: {
          name: p.name,
          internalCode: p.internalCode ?? null,
          description: p.description ?? null,
          application: p.application ?? null,
          material: p.material ?? null,
          treatment: p.treatment ?? null,
          isHighlighted: asBool(p.isHighlighted),
          categoryId: mappedCategoryId,
        },
        select: { id: true, slug: true },
      });

      productIdMap.set(p.id, created.id);
    }

    // Importa imagens sem duplicar por (productId,url)
    for (const img of images) {
      const mappedProductId = productIdMap.get(img.productId);
      if (!mappedProductId) continue;

      const exists = await prisma.productImage.findFirst({
        where: { productId: mappedProductId, url: img.url },
        select: { id: true },
      });

      if (!exists) {
        await prisma.productImage.create({
          data: {
            productId: mappedProductId,
            url: img.url,
            isPrimary: false,
          },
        });
      }
    }

    // Ajusta primary por produto de acordo com o SQLite (se existir algum isPrimary)
    const primariesByOldProduct = new Map();
    for (const img of images) {
      if (!asBool(img.isPrimary)) continue;
      if (!primariesByOldProduct.has(img.productId)) {
        primariesByOldProduct.set(img.productId, img.url);
      }
    }

    for (const [oldProductId, primaryUrl] of primariesByOldProduct.entries()) {
      const mappedProductId = productIdMap.get(oldProductId);
      if (!mappedProductId) continue;

      // zera todas
      await prisma.productImage.updateMany({
        where: { productId: mappedProductId },
        data: { isPrimary: false },
      });

      // seta a primary
      const primary = await prisma.productImage.findFirst({
        where: { productId: mappedProductId, url: primaryUrl },
        select: { id: true },
      });

      if (primary) {
        await prisma.productImage.update({
          where: { id: primary.id },
          data: { isPrimary: true },
        });
      }
    }

    // eslint-disable-next-line no-console
    console.log("Migração concluída:");
    // eslint-disable-next-line no-console
    console.log(`- Categories: ${categories.length}`);
    // eslint-disable-next-line no-console
    console.log(`- Products: ${products.length}`);
    // eslint-disable-next-line no-console
    console.log(`- ProductImage (rows in SQLite): ${images.length}`);
    // eslint-disable-next-line no-console
    console.log(
      "Obs: Imagens no disco (public/product-images, public/catalog-pages) NÃO são enviadas para a Vercel automaticamente."
    );
  } finally {
    db.close();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
