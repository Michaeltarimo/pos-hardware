import { prisma } from "@/lib/prisma";
import { SuppliersClient } from "@/app/suppliers/SuppliersClient";

export default async function SuppliersPage() {
  const suppliersRaw = await (prisma as unknown as {
    supplier: { findMany: (args: object) => Promise<
      { id: number; name: string; contactName: string | null; phone: string | null; location: string | null; purchases: { total: number; date: Date }[] }[]
    > };
  }).supplier.findMany({
    include: { purchases: { select: { total: true, date: true } } },
    orderBy: { name: "asc" },
  });

  const suppliers = suppliersRaw.map((s) => {
    const totalPurchases = s.purchases.reduce((sum, p) => sum + p.total, 0);
    const lastPurchase =
      s.purchases.length > 0
        ? new Date(Math.max(...s.purchases.map((p) => new Date(p.date).getTime())))
        : null;
    return {
      id: s.id,
      name: s.name,
      contactName: s.contactName ?? undefined,
      phone: s.phone ?? undefined,
      location: s.location ?? undefined,
      balance: 0,
      totalPurchases,
      lastPurchaseDate: lastPurchase ? lastPurchase.toISOString() : undefined,
    };
  });

  return <SuppliersClient initialSuppliers={suppliers} />;
}
