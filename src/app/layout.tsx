import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hardware POS",
  description: "Point of sale for Tarimo Hardware",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        <div className="flex min-h-screen">
          <aside className="hidden w-64 flex-shrink-0 border-r bg-white/80 px-4 py-6 shadow-sm md:block">
            <div className="mb-8">
              <h1 className="text-xl font-bold tracking-tight">
                Tarimo Hardware
              </h1>
              <p className="text-xs text-slate-500">POS System</p>
            </div>
            <nav className="space-y-2 text-sm">
              <a
                href="/"
                className="block rounded-md px-3 py-2 font-medium text-slate-800 hover:bg-slate-100"
              >
                Dashboard
              </a>
              <a
                href="/pos"
                className="block rounded-md px-3 py-2 font-medium text-slate-800 hover:bg-slate-100"
              >
                POS
              </a>
              <a
                href="/products"
                className="block rounded-md px-3 py-2 font-medium text-slate-800 hover:bg-slate-100"
              >
                Products
              </a>
              <a
                href="/purchases"
                className="block rounded-md px-3 py-2 font-medium text-slate-800 hover:bg-slate-100"
              >
                Purchases
              </a>
              <a
                href="/reports"
                className="block rounded-md px-3 py-2 font-medium text-slate-800 hover:bg-slate-100"
              >
                Reports
              </a>
            </nav>
          </aside>
          <main className="flex-1">
            <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
