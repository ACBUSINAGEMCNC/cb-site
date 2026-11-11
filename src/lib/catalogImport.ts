
import colheitadeira from "../../data/catalog/colheitadeira.json";
import plantadeira from "../../data/catalog/plantadeira.json";
import pulverizador from "../../data/catalog/pulverizador.json";
import { prisma } from "./prisma";

const catalogs = [
  {
    slug: "colheitadeira",
    name: "Colheitadeira John Deere",
    sortOrder: 1,
    data: colheitadeira,
  },
  {
    slug: "plantadeira",
    name: "Plantadeira John Deere",
    sortOrder: 2,
    data: plantadeira,
  },
  {
    slug: "pulverizador",
    name: "Pulverizador John Deere",
    sortOrder: 3,
    data: pulverizador,
  },
] as const;

export const CATALOG_SUMMARY = catalogs.map(({ slug, name, data }) => ({
  slug,
  name,
  products: data.items.length,
}));

export type CatalogImportResult = {
  categories: number;
  products: number;
  images: number;
  deleted?: {
    categories: number;
    products: number;
    images: number;
  };
};

async function deleteExistingCatalog() {
  return prisma.$transaction(async (transaction) => {
    const images = await transaction.productImage.deleteMany();
    const products = await transaction.product.deleteMany();
    const categories = await transaction.category.deleteMany();
    return {
      images: images.count,
      products: products.count,
      categories: categories.count,
    };
  });
}

async function upsertCatalogProduct(
  categoryId: number,
  item: (typeof catalogs)[number]["data"]["items"][number]
) {
  return prisma.$transaction(async (transaction) => {
    const product = await transaction.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        internalCode: item.code,
        application: item.models || null,
        categoryId,
      },
      create: {
        slug: item.slug,
        name: item.name,
        internalCode: item.code,
        application: item.models || null,
        categoryId,
      },
    });

    await transaction.productImage.deleteMany({
      where: { productId: product.id },
    });
    if (item.images.length > 0) {
      await transaction.productImage.createMany({
        data: item.images.map((url, sortOrder) => ({
          productId: product.id,
          url,
          isPrimary: sortOrder === 0,
          sortOrder,
        })),
      });
    }

    return item.images.length;
  });
}

async function mapInBatches<T>(
  values: T[],
  concurrency: number,
  worker: (value: T) => Promise<number>
) {
  let total = 0;
  for (let index = 0; index < values.length; index += concurrency) {
    const batch = values.slice(index, index + concurrency);
    const results = await Promise.all(batch.map(worker));
    total += results.reduce((sum, value) => sum + value, 0);
  }
  return total;
}

export async function importCatalog({
  replace,
}: {
  replace: boolean;
}): Promise<CatalogImportResult> {
  const deleted = replace ? await deleteExistingCatalog() : undefined;
  const categoryRecords = await Promise.all(
    catalogs.map(({ slug, name, sortOrder }) =>
      prisma.category.upsert({
        where: { slug },
        update: { name, sortOrder },
        create: { slug, name, sortOrder },
      })
    )
  );
  const categoryIds = new Map(
    catalogs.map((catalog, index) => [catalog.slug, categoryRecords[index].id])
  );
  const productsToImport = catalogs.flatMap((catalog) =>
    catalog.data.items.map((item) => ({
      categoryId: categoryIds.get(catalog.slug)!,
      item,
    }))
  );
  const images = await mapInBatches(productsToImport, 8, ({ categoryId, item }) =>
    upsertCatalogProduct(categoryId, item)
  );

  return {
    categories: categoryRecords.length,
    products: productsToImport.length,
    images,
    ...(deleted ? { deleted } : {}),
  };
}
