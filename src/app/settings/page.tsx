import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) redirect("/auth");

  const currentUser = await prisma.user.findUnique({
    where: { username: session },
  });
  if (!currentUser) redirect("/auth?status=invalid");

  const cashiers = await prisma.user.findMany({
    where: { role: "CASHIER" },
    select: { id: true, name: true, username: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <SettingsForm
      currentUser={{ name: currentUser.name, username: currentUser.username }}
      cashiers={cashiers}
    />
  );
}
