import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getPrisma(): PrismaClient {
  const cached = globalForPrisma.prisma;
  const client = cached ?? new PrismaClient();
  // If cached client is missing Product/Category/Unit/Supplier/Sale (e.g. schema was updated and generate ran but server wasn't restarted), use a fresh instance
  const hasProduct = typeof (client as unknown as { product?: { findMany?: unknown } }).product?.findMany === "function";
  const hasUnit = typeof (client as unknown as { unit?: { findMany?: unknown } }).unit?.findMany === "function";
  const hasSupplier = typeof (client as unknown as { supplier?: { findMany?: unknown } }).supplier?.findMany === "function";
  const hasSale = typeof (client as unknown as { sale?: { create?: unknown } }).sale?.create === "function";
  if (cached && (!hasProduct || !hasUnit || !hasSupplier || !hasSale)) {
    const fresh = new PrismaClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = fresh;
    return fresh;
  }
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrisma();
