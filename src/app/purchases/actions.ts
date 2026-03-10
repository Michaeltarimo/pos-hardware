"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type PurchaseLineInput = {
  productId: number;
  quantity: number;
  unitCost: number;
};

export async function createPurchase(
  supplierId: number,
  date: string,
  paymentType: string,
  lines: PurchaseLineInput[],
  discount: number = 0
): Promise<ActionResult> {
  if (!lines.length) return { ok: false, error: "Add at least one line item." };

  const validLines = lines.filter(
    (l) => l.productId > 0 && l.quantity > 0 && l.unitCost >= 0
  );
  if (validLines.length === 0) return { ok: false, error: "Add at least one valid line (product, quantity, cost)." };

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) return { ok: false, error: "Supplier not found." };

  const total = Math.max(
    0,
    validLines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0) - discount
  );

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        supplierId,
        date: new Date(date),
        total,
        paymentType: paymentType || null,
      },
    });

    for (const line of validLines) {
      await tx.purchaseLine.create({
        data: {
          purchaseId: purchase.id,
          productId: line.productId,
          quantity: line.quantity,
          unitCost: line.unitCost,
        },
      });
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { increment: line.quantity } },
      });
    }
  });

  revalidatePath("/purchases");
  revalidatePath("/products");
  return { ok: true };
}

export async function updatePurchase(id: number, date: string, paymentType: string): Promise<ActionResult> {
  const purchase = await prisma.purchase.findUnique({ where: { id } });
  if (!purchase) return { ok: false, error: "Purchase not found." };

  await prisma.purchase.update({
    where: { id },
    data: { date: new Date(date), paymentType: paymentType || null },
  });
  revalidatePath("/purchases");
  return { ok: true };
}

/** Full edit: replace lines and reconcile stock (old vs new quantities per product). */
export async function updatePurchaseFull(
  id: number,
  supplierId: number,
  date: string,
  paymentType: string,
  lines: PurchaseLineInput[],
  discount: number = 0
): Promise<ActionResult> {
  const validLines = lines.filter(
    (l) => l.productId > 0 && l.quantity > 0 && l.unitCost >= 0
  );
  if (validLines.length === 0) return { ok: false, error: "Add at least one valid line (product, quantity, cost)." };

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { lines: true },
  });
  if (!purchase) return { ok: false, error: "Purchase not found." };

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) return { ok: false, error: "Supplier not found." };

  const oldQtyByProduct = new Map<number, number>();
  for (const line of purchase.lines) {
    oldQtyByProduct.set(line.productId, (oldQtyByProduct.get(line.productId) ?? 0) + line.quantity);
  }
  const newQtyByProduct = new Map<number, number>();
  for (const line of validLines) {
    newQtyByProduct.set(line.productId, (newQtyByProduct.get(line.productId) ?? 0) + line.quantity);
  }

  const allProductIds = new Set([...oldQtyByProduct.keys(), ...newQtyByProduct.keys()]);
  for (const productId of allProductIds) {
    const oldQty = oldQtyByProduct.get(productId) ?? 0;
    const newQty = newQtyByProduct.get(productId) ?? 0;
    const delta = newQty - oldQty;
    if (delta < 0) {
      const product = await prisma.product.findUnique({ where: { id: productId }, select: { stock: true } });
      if (!product) return { ok: false, error: `Product ${productId} not found.` };
      if (product.stock + delta < 0) {
        return { ok: false, error: `Not enough stock to reduce: product has ${product.stock}, edit would reduce by ${-delta}.` };
      }
    }
  }

  const total = Math.max(
    0,
    validLines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0) - discount
  );

  await prisma.$transaction(async (tx) => {
    for (const productId of allProductIds) {
      const oldQty = oldQtyByProduct.get(productId) ?? 0;
      const newQty = newQtyByProduct.get(productId) ?? 0;
      const delta = newQty - oldQty;
      if (delta !== 0) {
        await tx.product.update({
          where: { id: productId },
          data: { stock: { increment: delta } },
        });
      }
    }
    await tx.purchase.update({
      where: { id },
      data: {
        supplierId,
        date: new Date(date),
        paymentType: paymentType || null,
        total,
      },
    });
    await tx.purchaseLine.deleteMany({ where: { purchaseId: id } });
    for (const line of validLines) {
      await tx.purchaseLine.create({
        data: {
          purchaseId: id,
          productId: line.productId,
          quantity: line.quantity,
          unitCost: line.unitCost,
        },
      });
    }
  });

  revalidatePath("/purchases");
  revalidatePath("/products");
  return { ok: true };
}

export async function deletePurchase(id: number): Promise<ActionResult> {
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { lines: true },
  });
  if (!purchase) return { ok: false, error: "Purchase not found." };

  await prisma.$transaction(async (tx) => {
    for (const line of purchase.lines) {
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } },
      });
    }
    await tx.purchase.delete({ where: { id } });
  });
  revalidatePath("/purchases");
  revalidatePath("/products");
  return { ok: true };
}
