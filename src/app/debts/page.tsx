"use client";

import { useMemo, useState } from "react";

type MockDebt = {
  id: number;
  customer: string;
  phone?: string;
  location?: string;
  amount: number;
  createdAt: string; // ISO string
  status: "open" | "forgiven" | "paid";
};

const mockDebts: MockDebt[] = [
  {
    id: 1,
    customer: "Juma Fundi",
    phone: "0712 123 456",
    location: "Mtaa wa Pili",
    amount: 35000,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    status: "open",
  },
  {
    id: 2,
    customer: "Mama Asha Duka",
    phone: "0754 987 654",
    location: "Sokoni",
    amount: 68000,
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    status: "open",
  },
  {
    id: 3,
    customer: "James Mkandarasi",
    phone: "0783 555 111",
    location: "Mtaa wa Kwanza",
    amount: 22000,
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    status: "forgiven",
  },
  {
    id: 4,
    customer: "Tulia Hardware",
    phone: "0733 000 777",
    location: "Barabara Kuu",
    amount: 125000,
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    status: "paid",
  },
];

function daysSince(dateStr: string) {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (24 * 3600 * 1000));
}

export default function DebtsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "forgiven" | "paid">("open");
  const [editingId, setEditingId] = useState<number | null>(null);

  const filteredDebts = useMemo(
    () =>
      mockDebts.filter((d) =>
        statusFilter === "all" ? true : d.status === statusFilter,
      ),
    [statusFilter],
  );

  const totals = useMemo(() => {
    const open = mockDebts
      .filter((d) => d.status === "open")
      .reduce((sum, d) => sum + d.amount, 0);
    const forgiven = mockDebts
      .filter((d) => d.status === "forgiven")
      .reduce((sum, d) => sum + d.amount, 0);
    const paid = mockDebts
      .filter((d) => d.status === "paid")
      .reduce((sum, d) => sum + d.amount, 0);
    return { open, forgiven, paid };
  }, []);

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Debts</h2>
          <p className="text-sm text-slate-500">
            Track customers who still owe Tarimo Hardware.
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
              Mock data for now. Later this will use real sales from the POS.
            </p>
          </div>
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

        <div className="overflow-hidden rounded-lg border border-slate-100">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Location</th>
                <th className="px-3 py-2 text-right font-medium">Amount</th>
                <th className="px-3 py-2 text-right font-medium">
                  Days since
                </th>
                <th className="px-3 py-2 text-right font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDebts.map((d, idx) => {
                const age = daysSince(d.createdAt);
                const statusBadge =
                  d.status === "open"
                    ? "bg-amber-50 text-amber-700 ring-amber-200"
                    : d.status === "paid"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-slate-50 text-slate-700 ring-slate-200";

                return (
                  <tr
                    key={d.id}
                    className={
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/40 border-t"
                    }
                  >
                    <td className="px-3 py-2 text-slate-800">{d.customer}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {d.phone || <span className="text-slate-400">–</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {d.location || <span className="text-slate-400">–</span>}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-800">
                      {d.amount.toLocaleString()} Tsh
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
                    <td className="px-3 py-2 text-right text-[11px]">
                      {d.status === "open" ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            className="cursor-pointer rounded-full border border-emerald-200 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50"
                          >
                            Mark paid
                          </button>
                          <button
                            type="button"
                            className="cursor-pointer rounded-full border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Forgive
                          </button>
                        </div>
                      ) : editingId === d.id ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            className="cursor-pointer rounded-full border border-emerald-200 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50"
                          >
                            Mark paid
                          </button>
                          <button
                            type="button"
                            className="cursor-pointer rounded-full border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Forgive
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="cursor-pointer rounded-full border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-50"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingId(d.id)}
                          className="cursor-pointer rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit status
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}


