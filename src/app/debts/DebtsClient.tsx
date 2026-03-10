"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { markDebtPaid, markDebtForgiven } from "./actions";

export type DebtStatus = "open" | "paid" | "forgiven";

export type DebtRow = {
  id: number;
  customer: string;
  date: string;
  total: number;
  amountReceived: number;
  balanceDue: number;
  status: DebtStatus;
};

type Props = { initialDebts: DebtRow[] };

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}

function daysSince(dateStr: string) {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (24 * 3600 * 1000));
}

export function DebtsClient({ initialDebts }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"all" | DebtStatus>("open");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filteredDebts = useMemo(() => {
    let list = initialDebts;
    if (statusFilter !== "all") list = list.filter((d) => d.status === statusFilter);
    const q = search.toLowerCase().trim();
    if (q) list = list.filter((d) => d.customer.toLowerCase().includes(q));
    return list;
  }, [initialDebts, statusFilter, search]);

  const totals = useMemo(() => {
    const open = initialDebts
      .filter((d) => d.status === "open")
      .reduce((sum, d) => sum + d.balanceDue, 0);
    const paid = initialDebts
      .filter((d) => d.status === "paid")
      .reduce((sum, d) => sum + d.total, 0); // total collected (amountReceived = total)
    const forgiven = initialDebts
      .filter((d) => d.status === "forgiven")
      .reduce((sum, d) => sum + d.balanceDue, 0); // amount written off
    return { open, paid, forgiven };
  }, [initialDebts]);

  const handleMarkPaid = async (id: number) => {
    setUpdatingId(id);
    const result = await markDebtPaid(id);
    setUpdatingId(null);
    if (result.ok) {
      toast.success("Debt marked as paid.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleForgive = async (id: number) => {
    if (!confirm("Mark this debt as forgiven? This cannot be undone.")) return;
    setUpdatingId(id);
    const result = await markDebtForgiven(id);
    setUpdatingId(null);
    if (result.ok) {
      toast.success("Debt forgiven.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Debts</h2>
          <p className="text-sm text-slate-500">
            Track customer debts from POS. Mark as paid or forgive.
          </p>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700">
            Open debts
          </p>
          <p className="mt-1 text-lg font-semibold text-amber-900">
            {totals.open.toLocaleString()} Tsh
          </p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700">
            Paid back
          </p>
          <p className="mt-1 text-lg font-semibold text-emerald-900">
            {totals.paid.toLocaleString()} Tsh
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
            Forgiven
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {totals.forgiven.toLocaleString()} Tsh
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Customer debts
            </p>
            <p className="text-xs text-slate-500">
              From POS. Use Mark paid when customer pays the balance; Forgive to write off.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer…"
              className="w-full rounded-full border border-slate-200 px-3 py-1.5 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 sm:w-56"
            />
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-50 p-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
              <button
                type="button"
                onClick={() => setStatusFilter("open")}
                className={`rounded-full px-3 py-1 ${
                  statusFilter === "open"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "hover:bg-slate-100"
                }`}
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("paid")}
                className={`rounded-full px-3 py-1 ${
                  statusFilter === "paid"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "hover:bg-slate-100"
                }`}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("forgiven")}
                className={`rounded-full px-3 py-1 ${
                  statusFilter === "forgiven"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "hover:bg-slate-100"
                }`}
              >
                Forgiven
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`rounded-full px-3 py-1 ${
                  statusFilter === "all"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "hover:bg-slate-100"
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-100">
          {filteredDebts.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-slate-500">
              {initialDebts.length === 0
                ? "No debts. They appear here when a POS sale is completed with amount received less than total."
                : "No debts match the current filter or search."}
            </div>
          ) : (
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Customer</th>
                  <th className="px-3 py-2 font-medium">Sale date</th>
                  <th className="px-3 py-2 text-right font-medium">Total (Tsh)</th>
                  <th className="px-3 py-2 text-right font-medium">Paid (Tsh)</th>
                  <th className="px-3 py-2 text-right font-medium">Balance due (Tsh)</th>
                  <th className="px-3 py-2 text-right font-medium">Days since</th>
                  <th className="px-3 py-2 text-right font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDebts.map((d, idx) => {
                  const age = daysSince(d.date);
                  const statusBadge =
                    d.status === "open"
                      ? "bg-amber-50 text-amber-700 ring-amber-200"
                      : d.status === "paid"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-slate-50 text-slate-700 ring-slate-200";
                  const busy = updatingId === d.id;

                  return (
                    <tr
                      key={d.id}
                      className={
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40 border-t"
                      }
                    >
                      <td className="px-3 py-2 text-slate-800">{d.customer}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {formatDate(d.date)}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-800">
                        {d.total.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {d.amountReceived.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-amber-700">
                        {d.balanceDue.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {age} days
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${statusBadge}`}
                        >
                          {d.status === "open"
                            ? "Open"
                            : d.status === "paid"
                              ? "Paid"
                              : "Forgiven"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {d.status === "open" ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleMarkPaid(d.id)}
                              className="cursor-pointer rounded-full border border-emerald-200 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                            >
                              {busy ? "…" : "Mark paid"}
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleForgive(d.id)}
                              className="cursor-pointer rounded-full border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                              Forgive
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
