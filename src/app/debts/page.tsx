import { prisma } from "@/lib/prisma";
import { DebtsClient } from "@/app/debts/DebtsClient";

export default async function DebtsPage() {
  const db = prisma as unknown as {
    sale: { findMany: (args: object) => Promise<
      { id: number; date: Date; total: number; amountReceived: number; customerName: string | null; debtStatus: string | null }[]
    > };
  };

  const allSales = await db.sale.findMany({
    select: { id: true, date: true, total: true, amountReceived: true, customerName: true, debtStatus: true },
    orderBy: { date: "desc" },
  });

  // Debt records: open (balance due), or previously marked paid/forgiven
  const debts = allSales
    .filter((s) => s.total > s.amountReceived || s.debtStatus === "paid" || s.debtStatus === "forgiven")
    .map((s) => {
      const status = s.debtStatus === "paid" ? "paid" as const
        : s.debtStatus === "forgiven" ? "forgiven" as const
        : "open" as const;
      return {
        id: s.id,
        customer: s.customerName?.trim() || "—",
        date: s.date.toISOString(),
        total: s.total,
        amountReceived: s.amountReceived,
        balanceDue: Math.max(0, s.total - s.amountReceived),
        status,
      };
    });

  return <DebtsClient initialDebts={debts} />;
}
