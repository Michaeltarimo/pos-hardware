import { prisma } from "@/lib/prisma";
import { PurchasesClient } from "@/app/purchases/PurchasesClient";

export default async function PurchasesPage() {
  const db = prisma as unknown as {
    purchase: { findMany: (args: object) => Promise<
      { id: number; supplierId: number; date: Date; total: number; paymentType: string | null; supplier: { name: string }; lines: { id: number; productId: number; quantity: number; unitCost: number; product: { name: string; code: string; unit: string } }[] }[]
    > };
    product: { findMany: (args: object) => Promise<{ id: number; name: string; code: string; unit: string; costPrice: number }[]> };
    supplier: { findMany: (args: object) => Promise<{ id: number; name: string }[]> };
  };

  const [purchases, products, suppliers] = await Promise.all([
    db.purchase.findMany({
      include: {
        supplier: { select: { name: true } },
        lines: { include: { product: { select: { name: true, code: true, unit: true } } } },
      },
      orderBy: { date: "desc" },
    }),
    db.product.findMany({
      select: { id: true, name: true, code: true, unit: true, costPrice: true },
      orderBy: { name: "asc" },
    }),
    db.supplier.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const initialPurchases = purchases.map((p) => ({
    id: p.id,
    supplierId: p.supplierId,
    date: p.date.toISOString(),
    supplier: p.supplier.name,
    total: p.total,
    paymentType: (p.paymentType || "cash") as "cash" | "mobile" | "credit",
    items: p.lines.map((l) => ({
      id: l.id,
      productId: l.productId,
      product: l.product.name,
      code: l.product.code,
      unit: l.product.unit,
      quantity: l.quantity,
      cost: l.unitCost,
    })),
  }));

  return (
    <PurchasesClient
      initialPurchases={initialPurchases}
      products={products}
      suppliers={suppliers}
    />
  );
}
