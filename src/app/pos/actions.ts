"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type SaleLineInput = {
  productId: number;
  quantity: number;
  price: number;
};

export type ActionResult = { ok: true } | { ok: false; error: string };

async function getSessionUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const username = cookieStore.get("session")?.value ?? null;
  if (!username) return null;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * Create a sale, its lines, and decrease product stock.
 * When amountReceived < total, the sale is stored as open debt (balanceDue = total - amountReceived).
 * Pass customerName when recording a debt so "Open customer debts" can show who owes.
 */
export async function completeSale(
  lines: SaleLineInput[],
  total: number,
  paymentMethod: string,
  amountReceived: number,
  customerName: string | null,
  discount: number = 0
): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: "Not logged in." };

  const validLines = lines.filter(
    (l) => l.productId > 0 && l.quantity > 0 && l.price >= 0
  );
  if (validLines.length === 0) return { ok: false, error: "Add at least one item to the sale." };

  const computedTotal = Math.max(
    0,
    validLines.reduce((sum, l) => sum + l.quantity * l.price, 0) - discount
  );
  if (total !== computedTotal) return { ok: false, error: "Total mismatch. Refresh and try again." };

  for (const line of validLines) {
    const product = await prisma.product.findUnique({
      where: { id: line.productId },
      select: { stock: true, name: true },
    });
    if (!product) return { ok: false, error: `Product not found (id ${line.productId}).` };
    if (product.stock < line.quantity) {
      return { ok: false, error: `Not enough stock for "${product.name}". Available: ${product.stock}.` };
    }
  }

  await prisma.$transaction(async (tx) => {
    const isDebt = amountReceived < total;
    const sale = await tx.sale.create({
      data: {
        userId,
        total,
        paymentMethod: paymentMethod || null,
        amountReceived: amountReceived ?? 0,
        customerName: customerName?.trim() || null,
        debtStatus: isDebt ? "open" : null,
      },
    });
    for (const line of validLines) {
      await tx.saleLine.create({
        data: {
          saleId: sale.id,
          productId: line.productId,
          quantity: line.quantity,
          price: line.price,
        },
      });
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } },
      });
    }
  });

  revalidatePath("/pos");
  revalidatePath("/products");
  revalidatePath("/reports");
  revalidatePath("/");
  return { ok: true };
}
