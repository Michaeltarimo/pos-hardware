"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ActionResult = { ok: true } | { ok: false; error: string };

function isOpenDebt(sale: { total: number; amountReceived: number; debtStatus: string | null }): boolean {
  if (sale.total <= sale.amountReceived) return false;
  return sale.debtStatus === null || sale.debtStatus === "open";
}

export async function markDebtPaid(saleId: number): Promise<ActionResult> {
  const sale = await prisma.sale.findUnique({ where: { id: saleId } });
  if (!sale) return { ok: false, error: "Sale not found." };
  if (!isOpenDebt(sale)) return { ok: false, error: "This debt is not open." };
  const balancePaidNow = sale.total - sale.amountReceived;
  await prisma.sale.update({
    where: { id: saleId },
    data: {
      amountReceived: sale.total,
      debtStatus: "paid",
      debtPaidAt: new Date(),
      debtPaymentAmount: balancePaidNow,
    },
  });
  revalidatePath("/debts");
  revalidatePath("/");
  revalidatePath("/reports");
  return { ok: true };
}

export async function markDebtForgiven(saleId: number): Promise<ActionResult> {
  const sale = await prisma.sale.findUnique({ where: { id: saleId } });
  if (!sale) return { ok: false, error: "Sale not found." };
  if (!isOpenDebt(sale)) return { ok: false, error: "This debt is not open." };
  await prisma.sale.update({
    where: { id: saleId },
    data: { debtStatus: "forgiven" },
  });
  revalidatePath("/debts");
  revalidatePath("/");
  return { ok: true };
}
