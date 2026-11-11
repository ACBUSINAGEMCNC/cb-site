import { importCatalog } from "../src/lib/catalogImport";
import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await importCatalog({
    replace: process.argv.includes("--replace"),
  });
  if (result.deleted) {
    console.log(
      `Deleted ${result.deleted.images} images, ${result.deleted.products} products, ${result.deleted.categories} categories.`
    );
  }
  console.log(
    `Imported ${result.categories} categories, ${result.products} products, ${result.images} images.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
