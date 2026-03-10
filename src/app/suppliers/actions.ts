"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createSupplier(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;

  if (!name) return { ok: false, error: "Supplier name is required." };

  await prisma.supplier.create({
    data: { name, contactName, phone, location },
  });
  revalidatePath("/suppliers");
  revalidatePath("/purchases");
  return { ok: true };
}

export async function updateSupplier(id: number, formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;

  if (!name) return { ok: false, error: "Supplier name is required." };

  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Supplier not found." };

  await prisma.supplier.update({
    where: { id },
    data: { name, contactName, phone, location },
  });
  revalidatePath("/suppliers");
  revalidatePath("/purchases");
  return { ok: true };
}

export async function deleteSupplier(id: number): Promise<ActionResult> {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: { _count: { select: { purchases: true } } },
  });
  if (!supplier) return { ok: false, error: "Supplier not found." };
  if (supplier._count.purchases > 0) {
    return { ok: false, error: "Cannot delete: this supplier has purchases. Remove or reassign them first." };
  }
  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/suppliers");
  revalidatePath("/purchases");
  return { ok: true };
}
