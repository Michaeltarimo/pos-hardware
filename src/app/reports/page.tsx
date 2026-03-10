import { prisma } from "@/lib/prisma";
import { ReportsClient } from "@/app/reports/ReportsClient";

export default async function ReportsPage() {
  const db = prisma as unknown as {
    sale: { findMany: (args: object) => Promise<
      { id: number; date: Date; total: number }[]
    > };
    saleLine: { findMany: (args: object) => Promise<
      { productId: number; quantity: number; price: number; sale: { date: Date } }[]
    > };
    product: { findMany: (args: object) => Promise<
      { id: number; name: string; code: string; unit: string; stock: number; costPrice: number; sellingPrice: number; category: { name: string } }[]
    > };
  };

  const [sales, debtPayments, saleLines, products] = await Promise.all([
    db.sale.findMany({
      select: { id: true, date: true, total: true },
      orderBy: { date: "asc" },
    }),
    (prisma as unknown as {
      sale: { findMany: (args: object) => Promise<
        { debtPaidAt: Date | null; debtPaymentAmount: number | null }[]
      > };
    }).sale.findMany({
      where: {
        debtPaidAt: { not: null },
        debtPaymentAmount: { not: null },
      },
      select: { debtPaidAt: true, debtPaymentAmount: true },
    }),
    db.saleLine.findMany({
      select: { productId: true, quantity: true, price: true, sale: { select: { date: true } } },
    }),
    db.product.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        unit: true,
        stock: true,
        costPrice: true,
        sellingPrice: true,
        category: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Daily sales: group by date (sale date) + add debt payments on the day they were paid
  const byDate = new Map<string, { count: number; total: number }>();
  for (const s of sales) {
    const dateStr = s.date.toISOString().slice(0, 10);
    const cur = byDate.get(dateStr) ?? { count: 0, total: 0 };
    cur.count += 1;
    cur.total += s.total;
    byDate.set(dateStr, cur);
  }
  for (const p of debtPayments) {
    if (!p.debtPaidAt || p.debtPaymentAmount == null) continue;
    const dateStr = p.debtPaidAt.toISOString().slice(0, 10);
    const cur = byDate.get(dateStr) ?? { count: 0, total: 0 };
    cur.total += p.debtPaymentAmount;
    byDate.set(dateStr, cur);
  }
  const dailySales = Array.from(byDate.entries())
    .map(([date, { count, total }], idx) => ({
      id: idx + 1,
      date,
      invoiceCount: count,
      totalAmount: total,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top products: group by productId (all-time)
  const byProduct = new Map<number, { quantity: number; amount: number }>();
  for (const line of saleLines) {
    const cur = byProduct.get(line.productId) ?? { quantity: 0, amount: 0 };
    cur.quantity += line.quantity;
    cur.amount += line.quantity * line.price;
    byProduct.set(line.productId, cur);
  }
  const productIds = Array.from(byProduct.keys());
  const productMap = new Map(products.map((p) => [p.id, p]));
  const topProducts = productIds
    .map((productId) => {
      const p = productMap.get(productId);
      const agg = byProduct.get(productId)!;
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        code: p.code,
        unit: p.unit,
        quantitySold: agg.quantity,
        totalAmount: agg.amount,
      };
    })
    .filter(Boolean) as { id: number; name: string; code: string; unit: string; quantitySold: number; totalAmount: number }[];
  topProducts.sort((a, b) => b.quantitySold - a.quantitySold);

  const stockProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    category: p.category.name,
    unit: p.unit,
    stock: p.stock,
    costPrice: p.costPrice,
    sellingPrice: p.sellingPrice,
  }));

  return (
    <ReportsClient
      dailySales={dailySales}
      topProducts={topProducts}
      stockProducts={stockProducts}
    />
  );
}
