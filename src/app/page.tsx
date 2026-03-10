import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/app/DashboardClient";

const CHART_COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#6366f1",
  "#06b6d4",
  "#e11d48",
  "#8b5cf6",
];

export default async function Home() {
  const db = prisma as unknown as {
    sale: { findMany: (args: object) => Promise<
      { id: number; date: Date; total: number }[]
    > };
    saleLine: { findMany: (args: object) => Promise<
      { quantity: number; price: number; product: { categoryId: number; category: { name: string } } }[]
    > };
    product: { findMany: (args: object) => Promise<
      { id: number; stock: number; costPrice: number; reorderLevel: number }[]
    > };
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const [sales, saleLines, products] = await Promise.all([
    db.sale.findMany({
      where: { date: { gte: weekStart } },
      select: { id: true, date: true, total: true },
    }),
    db.saleLine.findMany({
      select: {
        quantity: true,
        price: true,
        product: { select: { categoryId: true, category: { select: { name: true } } } },
      },
    }),
    db.product.findMany({
      select: { id: true, stock: true, costPrice: true, reorderLevel: true },
    }),
  ]);

  const openDebtSales = await (prisma as unknown as {
    sale: { findMany: (args: object) => Promise<
      { total: number; amountReceived: number; debtStatus: string | null }[]
    > };
  }).sale.findMany({
    where: {
      total: { gt: 0 },
    },
    select: { total: true, amountReceived: true, debtStatus: true },
  });
  const openDebtsSum = openDebtSales
    .filter((s) => s.total > s.amountReceived && (s.debtStatus === null || s.debtStatus === "open"))
    .reduce((sum, s) => sum + (s.total - s.amountReceived), 0);

  const todaySales = sales
    .filter((s) => s.date >= todayStart)
    .reduce((sum, s) => sum + s.total, 0);
  const weekTotal = sales.reduce((sum, s) => sum + s.total, 0);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekSalesByDay: { day: string; sales: number; invoices: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const daySales = sales.filter(
      (s) => s.date >= dayStart && s.date < dayEnd,
    );
    weekSalesByDay.push({
      day: dayLabels[dayStart.getDay()],
      sales: daySales.reduce((sum, s) => sum + s.total, 0),
      invoices: daySales.length,
    });
  }

  const stockValue = products.reduce(
    (sum, p) => sum + p.stock * p.costPrice,
    0,
  );
  const productCount = products.length;
  const lowStockCount = products.filter(
    (p) => p.stock < p.reorderLevel,
  ).length;

  const byCategory = new Map<string, number>();
  for (const line of saleLines) {
    const name = line.product.category.name;
    const amount = line.quantity * line.price;
    byCategory.set(name, (byCategory.get(name) ?? 0) + amount);
  }
  const totalCategorySales = Array.from(byCategory.values()).reduce(
    (a, b) => a + b,
    0,
  );
  const categoryShare = Array.from(byCategory.entries())
    .map(([name], idx) => ({
      name,
      value:
        totalCategorySales > 0
          ? Math.round(
              (100 * (byCategory.get(name) ?? 0)) / totalCategorySales,
            )
          : 0,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <DashboardClient
      weekSales={weekSalesByDay}
      todaySales={todaySales}
      weekTotal={weekTotal}
      stockValue={stockValue}
      productCount={productCount}
      lowStockCount={lowStockCount}
      openDebtsSum={openDebtsSum}
      categoryShare={categoryShare}
    />
  );
}
