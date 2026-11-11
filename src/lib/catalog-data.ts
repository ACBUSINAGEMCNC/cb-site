import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getProductBySlug = cache((slug: string) =>
  prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
    },
  })
);
