import { prisma } from "@/lib/prisma";
import { PosClient } from "@/app/pos/PosClient";

export default async function PosPage() {
  const db = prisma as unknown as {
    product: {
      findMany: (args: object) => Promise<
        { id: number; name: string; code: string; unit: string; sellingPrice: number }[]
      >;
    };
  };
  const rows = await db.product.findMany({
    select: { id: true, name: true, code: true, unit: true, sellingPrice: true },
    orderBy: { name: "asc" },
  });
  const products = rows.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    unit: p.unit,
    price: p.sellingPrice,
  }));

  return <PosClient products={products} />;
}
