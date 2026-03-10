import type React from "react";
import { prisma } from "@/lib/prisma";
import { ProductsClient } from "@/app/products/ProductsClient";

export default async function ProductsPage() {
  const [products, categories, units] = await Promise.all([
    (prisma as unknown as { product: { findMany: (args: object) => Promise<unknown[]> } }).product.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    }),
    (prisma as unknown as { category: { findMany: (args: object) => Promise<unknown[]> } }).category.findMany({
      select: { id: true, name: true, _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    (prisma as unknown as { unit: { findMany: (args?: object) => Promise<{ id: number; name: string; note: string | null }[]> } }).unit.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <ProductsClient
      products={products as React.ComponentProps<typeof ProductsClient>["products"]}
      categories={categories as React.ComponentProps<typeof ProductsClient>["categories"]}
      units={units}
    />
  );
}
