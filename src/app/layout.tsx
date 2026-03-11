import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { ToastFromUrl } from "@/components/ToastFromUrl";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Hardware POS",
  description: "Point of sale for Tarimo Hardware",
};

async function logout() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/auth?status=loggedout");
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (session) {
    const user = await prisma.user.findUnique({
      where: { username: session },
    });
    if (!user) {
      cookieStore.delete("session");
      redirect("/auth?status=invalid");
    }
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-sky-50 text-slate-900 antialiased">
        <Toaster position="top-right" richColors closeButton />
        <Suspense fallback={null}>
          <ToastFromUrl />
        </Suspense>
        <div className="flex min-h-screen justify-center">
          <div className="relative flex w-[80%] flex-col pt-28 pb-20">
            <TopNav showLogout logoutAction={logout} />
            <main className="flex-1 pb-10 pt-3">{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
