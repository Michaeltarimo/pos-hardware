"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  RectangleStackIcon,
  CubeIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

const mockWeekSales = [
  { day: "Mon", sales: 890_000, invoices: 12 },
  { day: "Tue", sales: 1_120_000, invoices: 15 },
  { day: "Wed", sales: 760_000, invoices: 10 },
  { day: "Thu", sales: 1_340_000, invoices: 18 },
  { day: "Fri", sales: 1_560_000, invoices: 22 },
  { day: "Sat", sales: 1_240_000, invoices: 16 },
  { day: "Sun", sales: 680_000, invoices: 9 },
];

const mockCategoryShare = [
  { name: "Cement", value: 32, color: "#0ea5e9" },
  { name: "Nails & Fasteners", value: 18, color: "#22c55e" },
  { name: "Paint", value: 15, color: "#f97316" },
  { name: "Electrical", value: 22, color: "#6366f1" },
  { name: "Tools & Other", value: 13, color: "#06b6d4" },
];

const shortcuts = [
  {
    href: "/pos",
    label: "POS",
    description: "New sale",
    icon: RectangleStackIcon,
    accent: "sky",
  },
  {
    href: "/products",
    label: "Products",
    description: "Stock & catalogue",
    icon: CubeIcon,
    accent: "emerald",
  },
  {
    href: "/purchases",
    label: "Purchases",
    description: "Stock in",
    icon: ArrowDownTrayIcon,
    accent: "amber",
  },
  {
    href: "/reports",
    label: "Reports",
    description: "Sales & stock reports",
    icon: ChartBarIcon,
    accent: "violet",
  },
  {
    href: "/suppliers",
    label: "Suppliers",
    description: "Manage suppliers",
    icon: BuildingStorefrontIcon,
    accent: "slate",
  },
  {
    href: "/debts",
    label: "Debts",
    description: "Customer debts",
    icon: UserGroupIcon,
    accent: "rose",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Account & backup",
    icon: Cog6ToothIcon,
    accent: "sky",
  },
];

const accentStyles: Record<string, string> = {
  sky: "bg-sky-500/10 text-sky-700 ring-1 ring-sky-200/80 hover:bg-sky-500/20",
  emerald: "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-200/80 hover:bg-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-200/80 hover:bg-amber-500/20",
  violet: "bg-violet-500/10 text-violet-700 ring-1 ring-violet-200/80 hover:bg-violet-500/20",
  slate: "bg-slate-500/10 text-slate-700 ring-1 ring-slate-200/80 hover:bg-slate-500/20",
  rose: "bg-rose-500/10 text-rose-700 ring-1 ring-rose-200/80 hover:bg-rose-500/20",
};

export default function Home() {
  const weekTotal = useMemo(
    () => mockWeekSales.reduce((s, d) => s + d.sales, 0),
    [],
  );
  const todaySales = mockWeekSales[5]?.sales ?? 1_240_000;
  const stockValue = 4_280_000;
  const productCount = 16;
  const lowStockCount = 2;
  const openDebtsSum = 125_000;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-1 flex-col space-y-8">
      {/* Welcome + Tarimo photo */}
      <header className="flex flex-row items-center justify-between gap-4 rounded-xl border border-sky-200/80 bg-gradient-to-r from-sky-50/80 to-white p-4 shadow-sm ring-1 ring-sky-100/50">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {greeting}, Tarimo
          </h1>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-sky-200/80 ring-offset-2">
          <Image
            src="/mzee-nobg.png"
            alt="Tarimo"
            fill
            className="object-cover object-top"
            priority
            sizes="80px"
          />
        </div>
      </header>

      {/* KPI cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm ring-1 ring-sky-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-sky-600">
                Today&apos;s sales
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {(todaySales / 1_000_000).toFixed(2)}M
              </p>
              <p className="text-xs text-slate-500">Tsh</p>
            </div>
            <div className="rounded-full bg-sky-500/20 p-2.5">
              <BanknotesIcon className="h-6 w-6 text-sky-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm ring-1 ring-emerald-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">
                This week
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {(weekTotal / 1_000_000).toFixed(2)}M
              </p>
              <p className="text-xs text-slate-500">Tsh</p>
            </div>
            <div className="rounded-full bg-emerald-500/20 p-2.5">
              <ArrowTrendingUpIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm ring-1 ring-amber-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-amber-600">
                Stock value
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {(stockValue / 1_000_000).toFixed(2)}M
              </p>
              <p className="text-xs text-slate-500">Tsh (cost)</p>
            </div>
            <div className="rounded-full bg-amber-500/20 p-2.5">
              <CubeIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
        <Link
          href="/products?lowStock=1"
          className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm ring-1 ring-slate-100/50 transition hover:border-amber-200 hover:ring-amber-100/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
                Products · Low stock
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {productCount}
                <span
                  className={
                    lowStockCount > 0
                      ? "ml-1 text-sm font-semibold text-red-600"
                      : "ml-1 text-sm font-medium text-slate-500"
                  }
                >
                  ({lowStockCount})
                </span>
              </p>
              <p className="text-xs text-slate-500">
                items need reorder · tap to view
              </p>
            </div>
            <div className="rounded-full bg-amber-500/20 p-2.5">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Link>
      </section>

      {/* Quick tip */}
      <section className="rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50/60 to-orange-50/40 p-3 shadow-sm ring-1 ring-amber-100/50">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
          Quick tip
        </p>
        <p className="mt-0.5 text-sm text-slate-700">
          Use <strong>Reports</strong> to see which products sell most. Restock
          those first to keep customers happy.
        </p>
      </section>

      {/* Shortcuts */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          Quick access
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-100/50 transition hover:shadow-md ${accentStyles[item.accent]}`}
              >
                <div className="rounded-lg bg-white/80 p-2.5 ring-1 ring-slate-200/80 group-hover:ring-slate-300">
                  <Icon className="h-5 w-5 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <p className="truncate text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Charts row */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-sky-200/80 bg-white p-4 shadow-sm ring-1 ring-sky-100/50">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Sales trend (this week)
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockWeekSales}>
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={(v) =>
                    v >= 1_000_000 ? `${v / 1_000_000}M` : `${v / 1_000}k`
                  }
                />
                <Tooltip
                  formatter={(value: unknown) => [
                    typeof value === "number"
                      ? `${(value / 1_000_000).toFixed(2)}M Tsh`
                      : String(value),
                    "Sales",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-sky-200/80 bg-white p-4 shadow-sm ring-1 ring-sky-100/50">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Sales by category (share %)
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            {mockCategoryShare.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium text-slate-700">
                  {item.name}
                </span>
                <span className="text-xs text-slate-500">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom strip: open debts + link */}
      <section className="rounded-xl border border-rose-200/60 bg-gradient-to-br from-rose-50/80 to-white p-4 shadow-sm ring-1 ring-rose-100/50">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-rose-500/20 p-2.5">
              <UserGroupIcon className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-rose-700">
                Open customer debts
              </p>
              <p className="text-lg font-bold text-slate-900">
                {openDebtsSum.toLocaleString()} Tsh
              </p>
            </div>
          </div>
          <Link
            href="/debts"
            className="inline-flex items-center rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
          >
            View debts
          </Link>
        </div>
      </section>
    </div>
  );
}
