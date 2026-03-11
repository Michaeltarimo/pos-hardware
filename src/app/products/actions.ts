"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const categoryId = Number(formData.get("categoryId"));
  const unit = String(formData.get("unit") ?? "").trim();
  const packInfo = String(formData.get("packInfo") ?? "").trim() || null;
  const costPrice = Number(formData.get("costPrice")) || 0;
  const sellingPrice = Number(formData.get("sellingPrice")) || 0;
  const stock = Number(formData.get("stock")) || 0;
  const reorderLevel = Number(formData.get("reorderLevel")) || 20;

  if (!name) return { ok: false, error: "Product name is required." };
  if (!code) return { ok: false, error: "Code / SKU is required." };
  if (!categoryId || isNaN(categoryId)) return { ok: false, error: "Category is required." };
  if (!unit) return { ok: false, error: "Unit is required." };
  if (costPrice < 0 || sellingPrice < 0) return { ok: false, error: "Prices cannot be negative." };
  if (stock < 0) return { ok: false, error: "Stock cannot be negative." };

  const existing = await prisma.product.findUnique({ where: { code } });
  if (existing) return { ok: false, error: "A product with this code already exists." };

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { ok: false, error: "Invalid category." };

  await prisma.product.create({
    data: {
      name,
      code,
      categoryId,
      unit,
      packInfo,
      costPrice,
      sellingPrice,
      stock,
      reorderLevel,
    },
  });
  revalidatePath("/products");
  return { ok: true };
}

export async function updateProduct(id: number, formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const categoryId = Number(formData.get("categoryId"));
  const unit = String(formData.get("unit") ?? "").trim();
  const packInfo = String(formData.get("packInfo") ?? "").trim() || null;
  const costPrice = Number(formData.get("costPrice")) || 0;
  const sellingPrice = Number(formData.get("sellingPrice")) || 0;
  const stock = Number(formData.get("stock")) || 0;
  const reorderLevel = Number(formData.get("reorderLevel")) || 20;

  if (!name) return { ok: false, error: "Product name is required." };
  if (!code) return { ok: false, error: "Code / SKU is required." };
  if (!categoryId || isNaN(categoryId)) return { ok: false, error: "Category is required." };
  if (!unit) return { ok: false, error: "Unit is required." };
  if (costPrice < 0 || sellingPrice < 0) return { ok: false, error: "Prices cannot be negative." };
  if (stock < 0) return { ok: false, error: "Stock cannot be negative." };

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Product not found." };

  const codeTaken = await prisma.product.findFirst({
    where: { code, NOT: { id } },
  });
  if (codeTaken) return { ok: false, error: "A product with this code already exists." };

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { ok: false, error: "Invalid category." };

  await prisma.product.update({
    where: { id },
    data: {
      name,
      code,
      categoryId,
      unit,
      packInfo,
      costPrice,
      sellingPrice,
      stock,
      reorderLevel,
    },
  });
  revalidatePath("/products");
  return { ok: true };
}

export async function deleteProduct(id: number): Promise<ActionResult> {
  const existing = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: { select: { purchaseLines: true, saleLines: true } },
    },
  });
  if (!existing) return { ok: false, error: "Product not found." };

  if (existing._count.purchaseLines > 0 || existing._count.saleLines > 0) {
    return {
      ok: false,
      error:
        "Cannot delete this product because it is used in purchases or sales. For audit/history, keep it (or we can add an Archive feature).",
    };
  }

  try {
    await prisma.product.delete({ where: { id } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // Fallback for FK constraint errors (Prisma P2003 etc.)
    if (message.toLowerCase().includes("foreign key")) {
      return {
        ok: false,
        error:
          "Cannot delete this product because it is referenced by other records (purchases/sales).",
      };
    }
    throw err;
  }
  revalidatePath("/products");
  return { ok: true };
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Category name is required." };

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return { ok: false, error: "A category with this name already exists." };

  await prisma.category.create({ data: { name } });
  revalidatePath("/products");
  return { ok: true };
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) return { ok: false, error: "Category not found." };
  if (category._count.products > 0) {
    return { ok: false, error: "Cannot delete a category that has products. Move or delete the products first." };
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/products");
  return { ok: true };
}

export async function createUnit(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim().toLowerCase();
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!name) return { ok: false, error: "Unit name is required." };

  const existing = await prisma.unit.findUnique({ where: { name } });
  if (existing) return { ok: false, error: "A unit with this name already exists." };

  await prisma.unit.create({ data: { name, note } });
  revalidatePath("/products");
  return { ok: true };
}

export async function deleteUnit(id: number): Promise<ActionResult> {
  const unit = await prisma.unit.findUnique({ where: { id } });
  if (!unit) return { ok: false, error: "Unit not found." };

  const inUse = await prisma.product.count({ where: { unit: unit.name } });
  if (inUse > 0) {
    return { ok: false, error: `Cannot delete: ${inUse} product(s) use this unit. Change their unit first.` };
  }

  await prisma.unit.delete({ where: { id } });
  revalidatePath("/products");
  return { ok: true };
}
