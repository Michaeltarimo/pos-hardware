import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getPrisma(): PrismaClient {
  const cached = globalForPrisma.prisma;
  const client = cached ?? new PrismaClient();
  // If cached client is missing Product/Category (e.g. schema was updated and generate ran but server wasn't restarted), use a fresh instance
  if (cached && typeof (client as unknown as { product?: { findMany?: unknown } }).product?.findMany !== "function") {
    const fresh = new PrismaClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = fresh;
    return fresh;
  }
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrisma();
