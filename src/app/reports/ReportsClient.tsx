"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type StockProduct = {
  id: number;
  name: string;
  code: string;
  category: string;
  unit: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
};

export type DailySale = {
  id: number;
  date: string;
  invoiceCount: number;
  totalAmount: number;
};

export type ProductSalesSummary = {
  id: number;
  name: string;
  code: string;
  unit: string;
  quantitySold: number;
  totalAmount: number;
};

const PIE_COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#6366f1",
  "#e11d48",
  "#06b6d4",
];

type Props = {
  dailySales: DailySale[];
  topProducts: ProductSalesSummary[];
  stockProducts: StockProduct[];
};

export function ReportsClient({
  dailySales,
  topProducts,
  stockProducts,
}: Props) {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [stockSearch, setStockSearch] = useState("");

  const filteredDailySales = useMemo(() => {
    return dailySales.filter((d) => {
      const ts = new Date(d.date).getTime();
      if (fromDate) {
        const fromTs = new Date(fromDate).getTime();
        if (ts < fromTs) return false;
      }
      if (toDate) {
        const toTs = new Date(toDate).getTime();
        if (ts > toTs) return false;
      }
      return true;
    });
  }, [dailySales, fromDate, toDate]);

  const pieData = useMemo(
    () =>
      topProducts.map((p) => ({
        name: p.name,
        value: p.quantitySold,
      })),
    [topProducts],
  );

  const dailyChartData = useMemo(
    () =>
      [...filteredDailySales]
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        )
        .map((d) => ({
          date: new Date(d.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
          amount: d.totalAmount,
          invoices: d.invoiceCount,
        })),
    [filteredDailySales],
  );

  const filteredStock = useMemo(() => {
    const q = stockSearch.toLowerCase().trim();
    if (!q) return stockProducts;
    return stockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [stockProducts, stockSearch]);

  const totals = useMemo(() => {
    const totalSalesAmount = filteredDailySales.reduce(
      (sum, d) => sum + d.totalAmount,
      0,
    );
    const totalInvoices = filteredDailySales.reduce(
      (sum, d) => sum + d.invoiceCount,
      0,
    );
    const stockCostValue = stockProducts.reduce(
      (sum, p) => sum + p.stock * p.costPrice,
      0,
    );
    const stockSaleValue = stockProducts.reduce(
      (sum, p) => sum + p.stock * p.sellingPrice,
      0,
    );
    return {
      totalSalesAmount,
      totalInvoices,
      stockCostValue,
      stockSaleValue,
    };
  }, [filteredDailySales, stockProducts]);

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
          <p className="text-sm text-slate-500">
            High-level overview of sales and stock for Tarimo Hardware.
          </p>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-sky-700">
            Sales in range
          </p>
          <p className="mt-1 text-lg font-semibold text-sky-900">
            {totals.totalSalesAmount.toLocaleString()} Tsh
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {totals.totalInvoices} invoice(s)
          </p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700">
            Stock value (cost)
          </p>
          <p className="mt-1 text-lg font-semibold text-emerald-900">
            {totals.stockCostValue.toLocaleString()} Tsh
          </p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700">
            Stock value (selling)
          </p>
          <p className="mt-1 text-lg font-semibold text-amber-900">
            {totals.stockSaleValue.toLocaleString()} Tsh
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-700">
            Number of products
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {stockProducts.length}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Daily sales summary
              </p>
              <p className="text-xs text-slate-500">
                From POS. Filter by date range.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <label className="flex items-center gap-1">
                <span>From</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
                />
              </label>
              <label className="flex items-center gap-1">
                <span>To</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
                />
              </label>
            </div>
          </div>

          {dailyChartData.length > 0 && (
            <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                Sales trend (by day)
              </p>
              <div className="h-48 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      stroke="#64748b"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="#64748b"
                      tickFormatter={(v) =>
                        v >= 1_000_000
                          ? `${v / 1_000_000}M`
                          : v >= 1_000
                            ? `${v / 1_000}k`
                            : v
                      }
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        String(name) === "amount" && typeof value === "number"
                          ? `${value.toLocaleString()} Tsh`
                          : value,
                        String(name) === "amount" ? "Total" : "Invoices",
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#0ea5e9"
                      name="Total sales"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-slate-100">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 text-right font-medium">
                    Invoices
                  </th>
                  <th className="px-3 py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredDailySales.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                      No sales in selected range.
                    </td>
                  </tr>
                ) : (
                  filteredDailySales.map((d, idx) => (
                    <tr
                      key={d.id}
                      className={
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40 border-t"
                      }
                    >
                      <td className="px-3 py-2 text-slate-700">
                        {new Date(d.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {d.invoiceCount}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-800">
                        {d.totalAmount.toLocaleString()} Tsh
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pieData.length > 0 && (
            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                Sales mix (by quantity sold, all time)
              </p>
              <div className="h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `${value ?? 0} sold`,
                        "Quantity",
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Top-selling products
              </p>
              <p className="text-xs text-slate-500">
                By quantity sold (all time, from POS sales).
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-100">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 text-right font-medium">
                    Quantity sold
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    Total amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                      No sales yet.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40 border-t"
                      }
                    >
                      <td className="px-3 py-2 text-slate-800">{p.name}</td>
                      <td className="px-3 py-2 font-mono text-slate-500">
                        {p.code}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {p.quantitySold} {p.unit}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-800">
                        {p.totalAmount.toLocaleString()} Tsh
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Current stock list
            </p>
            <p className="text-xs text-slate-500">
              Products, stock on hand, and values from database.
            </p>
          </div>
          <input
            type="text"
            value={stockSearch}
            onChange={(e) => setStockSearch(e.target.value)}
            placeholder="Search by name, code, or category…"
            className="w-full max-w-xs rounded-full border border-slate-200 px-3 py-1.5 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-100">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 text-right font-medium">On hand</th>
                <th className="px-3 py-2 text-right font-medium">
                  Cost value
                </th>
                <th className="px-3 py-2 text-right font-medium">
                  Potential sale
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No products match.
                  </td>
                </tr>
              ) : (
                filteredStock.map((p, idx) => {
                  const costValue = p.stock * p.costPrice;
                  const saleValue = p.stock * p.sellingPrice;
                  return (
                    <tr
                      key={p.id}
                      className={
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40 border-t"
                      }
                    >
                      <td className="px-3 py-2 text-slate-800">{p.name}</td>
                      <td className="px-3 py-2 font-mono text-slate-500">
                        {p.code}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{p.category}</td>
                      <td className="px-3 py-2 text-right text-slate-800">
                        {p.stock} {p.unit}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-800">
                        {costValue.toLocaleString()} Tsh
                      </td>
                      <td className="px-3 py-2 text-right text-slate-800">
                        {saleValue.toLocaleString()} Tsh
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
