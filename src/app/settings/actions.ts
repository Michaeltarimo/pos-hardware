"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function getSessionUsername(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value ?? null;
}

export type AccountResult = { ok: true } | { ok: false; error: string };
export type CashierResult = { ok: true } | { ok: false; error: string };

/** Update the logged-in admin's name, username, and/or password. */
export async function updateAdminAccount(formData: FormData): Promise<AccountResult> {
  const username = await getSessionUsername();
  if (!username) return { ok: false, error: "Not logged in." };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.role !== "ADMIN") return { ok: false, error: "Unauthorized." };

  const newName = String(formData.get("name") ?? "").trim() || user.name;
  const newUsername = String(formData.get("username") ?? "").trim().toLowerCase() || user.username;
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const changingPassword = newPassword.length > 0;
  const changingUsername = newUsername !== user.username;

  if (changingPassword || changingUsername) {
    if (!currentPassword) return { ok: false, error: "Current password is required to make changes." };
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return { ok: false, error: "Current password is incorrect." };
  }

  if (changingPassword) {
    if (newPassword.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
    if (newPassword !== confirmPassword) return { ok: false, error: "New passwords do not match." };
  }

  if (changingUsername) {
    const existing = await prisma.user.findUnique({ where: { username: newUsername } });
    if (existing) return { ok: false, error: "That username is already taken." };
  }

  const updateData: { name?: string; username?: string; passwordHash?: string } = {
    name: newName,
    username: newUsername,
  };
  if (changingPassword) {
    updateData.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  if (changingUsername) {
    const cookieStore = await cookies();
    cookieStore.set("session", newUsername, { httpOnly: true, path: "/", maxAge: 60 * 60 * 8 });
  }

  revalidatePath("/settings");
  return { ok: true };
}

/** Create a new cashier user. Only admin. */
export async function addCashier(formData: FormData): Promise<CashierResult> {
  const username = await getSessionUsername();
  if (!username) return { ok: false, error: "Not logged in." };

  const admin = await prisma.user.findUnique({ where: { username } });
  if (!admin || admin.role !== "ADMIN") return { ok: false, error: "Only admin can add cashiers." };

  const name = String(formData.get("name") ?? "").trim();
  const newUsername = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!name) return { ok: false, error: "Full name is required." };
  if (!newUsername) return { ok: false, error: "Username is required." };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
  if (password !== confirm) return { ok: false, error: "Passwords do not match." };

  const existing = await prisma.user.findUnique({ where: { username: newUsername } });
  if (existing) return { ok: false, error: "That username is already taken." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, username: newUsername, passwordHash, role: "CASHIER" },
  });

  revalidatePath("/settings");
  return { ok: true };
}

/** Remove a cashier. Only admin. Cannot remove self. */
export async function removeCashier(cashierId: number): Promise<CashierResult> {
  const username = await getSessionUsername();
  if (!username) return { ok: false, error: "Not logged in." };

  const admin = await prisma.user.findUnique({ where: { username } });
  if (!admin || admin.role !== "ADMIN") return { ok: false, error: "Only admin can remove cashiers." };

  const target = await prisma.user.findUnique({ where: { id: cashierId } });
  if (!target) return { ok: false, error: "User not found." };
  if (target.role !== "CASHIER") return { ok: false, error: "Can only remove cashier accounts." };
  if (target.id === admin.id) return { ok: false, error: "You cannot remove your own account." };

  await prisma.user.delete({ where: { id: cashierId } });
  revalidatePath("/settings");
  return { ok: true };
}

/** Update a cashier's password. Only admin. */
export async function updateCashierPassword(
  cashierId: number,
  formData: FormData
): Promise<CashierResult> {
  const username = await getSessionUsername();
  if (!username) return { ok: false, error: "Not logged in." };

  const admin = await prisma.user.findUnique({ where: { username } });
  if (!admin || admin.role !== "ADMIN") return { ok: false, error: "Only admin can update cashiers." };

  const target = await prisma.user.findUnique({ where: { id: cashierId } });
  if (!target) return { ok: false, error: "User not found." };
  if (target.role !== "CASHIER") return { ok: false, error: "Can only update cashier accounts." };

  const newPassword = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
  if (newPassword !== confirm) return { ok: false, error: "Passwords do not match." };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: cashierId },
    data: { passwordHash },
  });

  revalidatePath("/settings");
  return { ok: true };
}

/** Reset system data (keep admin). Only admin. */
export async function resetSystem(): Promise<AccountResult> {
  const username = await getSessionUsername();
  if (!username) return { ok: false, error: "Not logged in." };

  const admin = await prisma.user.findUnique({ where: { username } });
  if (!admin || admin.role !== "ADMIN") return { ok: false, error: "Only admin can reset the system." };

  await prisma.$transaction(async (tx) => {
    // Delete in FK-safe order
    await tx.saleLine.deleteMany({});
    await tx.sale.deleteMany({});
    await tx.purchaseLine.deleteMany({});
    await tx.purchase.deleteMany({});

    await tx.product.deleteMany({});
    await tx.category.deleteMany({});
    await tx.unit.deleteMany({});
    await tx.supplier.deleteMany({});

    // Remove all cashiers (keep current admin)
    await tx.user.deleteMany({ where: { role: "CASHIER" } });
  });

  revalidatePath("/");
  revalidatePath("/pos");
  revalidatePath("/products");
  revalidatePath("/purchases");
  revalidatePath("/suppliers");
  revalidatePath("/debts");
  revalidatePath("/reports");
  revalidatePath("/settings");
  return { ok: true };
}
