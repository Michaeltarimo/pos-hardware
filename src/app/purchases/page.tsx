"use client";

import { useMemo, useState } from "react";

type PurchaseLine = {
  id: number;
  product: string;
  code: string;
  unit: string;
  quantity: number;
  cost: number;
};

type Purchase = {
  id: number;
  date: string; // ISO
  supplier: string;
  reference?: string;
  total: number;
  items: PurchaseLine[];
  paymentType: "cash" | "mobile" | "credit";
};

const mockPurchases: Purchase[] = [
  {
    id: 1,
    date: new Date().toISOString(),
    supplier: "Twiga Cement",
    reference: "INV-2026-001",
    total: 680_000,
    paymentType: "cash",
    items: [
      {
        id: 1,
        product: "Cement 50kg",
        code: "CM-50KG",
        unit: "bag",
        quantity: 40,
        cost: 17_000,
      },
    ],
  },
  {
    id: 2,
    date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    supplier: "Juma Hardware Wholesale",
    reference: "INV-2026-045",
    total: 245_000,
    paymentType: "credit",
    items: [
      {
        id: 1,
        product: "3-inch Nails (Box of 100)",
        code: "NL-3IN-100",
        unit: "box",
        quantity: 15,
        cost: 6_500,
      },
      {
        id: 2,
        product: "4-inch Nails (Box of 100)",
        code: "NL-4IN-100",
        unit: "box",
        quantity: 10,
        cost: 7_000,
      },
    ],
  },
  {
    id: 3,
    date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    supplier: "Super Paints Ltd",
    reference: "PO-2026-112",
    total: 390_000,
    paymentType: "mobile",
    items: [
      {
        id: 1,
        product: "White Emulsion Paint 20L",
        code: "PT-WH-20L",
        unit: "bucket",
        quantity: 5,
        cost: 42_000,
      },
      {
        id: 2,
        product: "Gloss Paint Black 4L",
        code: "PT-GL-BLK-4L",
        unit: "tin",
        quantity: 3,
        cost: 21_000,
      },
    ],
  },
];

// Reuse a small mock product list so the "New purchase"
// modal can let you pick actual items for the front-end UI.
const mockProducts = [
  {
    id: 1,
    name: "3-inch Nails (Box of 100)",
    code: "NL-3IN-100",
    unit: "box",
    price: 6500,
  },
  {
    id: 2,
    name: "4-inch Nails (Box of 100)",
    code: "NL-4IN-100",
    unit: "box",
    price: 7000,
  },
  {
    id: 3,
    name: "Cement 50kg",
    code: "CM-50KG",
    unit: "bag",
    price: 17000,
  },
  {
    id: 4,
    name: "White Emulsion Paint 20L",
    code: "PT-WH-20L",
    unit: "bucket",
    price: 42000,
  },
  {
    id: 5,
    name: "Gloss Paint Black 4L",
    code: "PT-GL-BLK-4L",
    unit: "tin",
    price: 21000,
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}

export default function PurchasesPage() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [showQuickSupplier, setShowQuickSupplier] = useState(false);
  const [lines, setLines] = useState<
    { id: number; productId?: number; quantity: number; unitCost: number }[]
  >([
    { id: 1, productId: undefined, quantity: 1, unitCost: 0 },
  ]);

  const filteredPurchases = useMemo(() => {
    return mockPurchases.filter((p) => {
      const d = new Date(p.date).getTime();
      if (fromDate) {
        const f = new Date(fromDate).getTime();
        if (d < f) return false;
      }
      if (toDate) {
        const t = new Date(toDate).getTime();
        if (d > t) return false;
      }
      return true;
    });
  }, [fromDate, toDate]);

  const totalSpent = useMemo(
    () => filteredPurchases.reduce((sum, p) => sum + p.total, 0),
    [filteredPurchases],
  );

  const todayTotal = useMemo(() => {
    const todayStr = new Date().toDateString();
    return filteredPurchases
      .filter((p) => new Date(p.date).toDateString() === todayStr)
      .reduce((sum, p) => sum + p.total, 0);
  }, [filteredPurchases]);

  const linesSubtotal = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + (line.quantity || 0) * (line.unitCost || 0),
        0,
      ),
    [lines],
  );

  const linesTotal = useMemo(
    () => Math.max(0, linesSubtotal - (discount || 0)),
    [linesSubtotal, discount],
  );

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Purchases</h2>
          <p className="text-sm text-slate-500">
            Record stock coming in from suppliers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="inline-flex cursor-pointer items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          + New purchase
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-sky-700">
            Today&apos;s purchases
          </p>
          <p className="mt-1 text-lg font-semibold text-sky-900">
            {todayTotal.toLocaleString()} Tsh
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
            Filtered total
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {totalSpent.toLocaleString()} Tsh
          </p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700">
            Number of purchases
          </p>
          <p className="mt-1 text-lg font-semibold text-emerald-900">
            {filteredPurchases.length}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Purchase history
            </p>
            <p className="text-xs text-slate-500">
              Filter by date range to see past stock in.
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

        <div className="overflow-hidden rounded-lg border border-slate-100">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Supplier</th>
                <th className="px-3 py-2 font-medium">Reference</th>
                <th className="px-3 py-2 text-right font-medium">Items</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
                <th className="px-3 py-2 text-right font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((p, idx) => (
                <tr
                  key={p.id}
                  className={
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/40 border-t"
                  }
                >
                  <td className="px-3 py-2 text-slate-700">
                    {formatDate(p.date)}
                  </td>
                  <td className="px-3 py-2 text-slate-800">{p.supplier}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {p.reference || <span className="text-slate-400">–</span>}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-700">
                    {p.items.length}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-800">
                    {p.total.toLocaleString()} Tsh
                  </td>
                  <td className="px-3 py-2 text-right text-[11px]">
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                        p.paymentType === "cash"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : p.paymentType === "mobile"
                          ? "bg-sky-50 text-sky-700 ring-sky-200"
                          : "bg-amber-50 text-amber-700 ring-amber-200"
                      }`}
                    >
                      {p.paymentType === "cash"
                        ? "Cash"
                        : p.paymentType === "mobile"
                        ? "Mobile"
                        : "Credit"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showNewModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl ring-1 ring-sky-100">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  New purchase
                </h3>
                <p className="text-xs text-slate-500">
                  Record stock coming in from a supplier. (Mock only for now.)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="rounded-full px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <form
              className="space-y-4 text-sm"
              onSubmit={(e) => {
                e.preventDefault();
                // For now this is front-end only: just close the modal.
                setShowNewModal(false);
              }}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Date
                  </label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Supplier
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Twiga Cement"
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowQuickSupplier((prev) => !prev)}
                      className="hidden cursor-pointer rounded-full border border-slate-200 px-3 py-2 text-[11px] text-slate-600 hover:bg-slate-50 sm:inline-flex"
                    >
                      {showQuickSupplier ? "Close" : "+ New"}
                    </button>
                  </div>
                  {showQuickSupplier && (
                    <div className="mt-2 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        Quick add supplier (mock)
                      </p>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="space-y-1 sm:col-span-1">
                          <label className="text-[11px] font-medium text-slate-500">
                            Supplier name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Twiga Cement"
                            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-500">
                            Contact person
                          </label>
                          <input
                            type="text"
                            placeholder="Optional"
                            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-500">
                            Phone
                          </label>
                          <input
                            type="tel"
                            placeholder="Optional"
                            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[11px] font-medium text-slate-500">
                            Location / notes
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Kariakoo, main market"
                            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                          />
                        </div>
                        <div className="flex items-end justify-end">
                          <button
                            type="button"
                            className="inline-flex items-center rounded-full bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-sky-700"
                            onClick={() => {
                              // Mock only: just collapse the quick add section for now.
                              setShowQuickSupplier(false);
                            }}
                          >
                            Save supplier (mock)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Line items (what you are adding to stock)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Choose products, enter quantity and purchase cost. This UI
                      is front-end only for now.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setLines((prev) => [
                        ...prev,
                        {
                          id:
                            (prev[prev.length - 1]?.id ?? 0) +
                            1,
                          productId: undefined,
                          quantity: 1,
                          unitCost: 0,
                        },
                      ])
                    }
                    className="rounded-full bg-sky-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-sky-700"
                  >
                    + Add line
                  </button>
                </div>

                <div className="mt-2 max-h-52 overflow-auto rounded-md border border-slate-100 bg-white">
                  <table className="min-w-full border-collapse text-left text-[11px]">
                    <thead className="bg-slate-50 uppercase text-slate-500">
                      <tr>
                        <th className="px-2 py-1 font-medium">Product</th>
                        <th className="px-2 py-1 font-medium">Code</th>
                        <th className="px-2 py-1 font-medium">Unit</th>
                        <th className="px-2 py-1 text-right font-medium">
                          Qty
                        </th>
                        <th className="px-2 py-1 text-right font-medium">
                          Cost / unit
                        </th>
                        <th className="px-2 py-1 text-right font-medium">
                          Line total
                        </th>
                        <th className="px-2 py-1 text-right font-medium">
                          &nbsp;
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => {
                        const product = mockProducts.find(
                          (p) => p.id === line.productId,
                        );
                        const lineTotal =
                          (line.quantity || 0) * (line.unitCost || 0);

                        return (
                          <tr key={line.id} className="border-t last:border-b-0">
                            <td className="px-2 py-1 text-slate-800">
                              <select
                                className="w-full rounded-md border border-slate-200 px-2 py-1 text-[11px] outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
                                value={line.productId ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const productId = value
                                    ? Number(value)
                                    : undefined;
                                  const selected = mockProducts.find(
                                    (p) => p.id === productId,
                                  );
                                  setLines((prev) =>
                                    prev.map((l) =>
                                      l.id === line.id
                                        ? {
                                            ...l,
                                            productId,
                                            unitCost:
                                              l.unitCost === 0 &&
                                              selected
                                                ? selected.price
                                                : l.unitCost,
                                          }
                                        : l,
                                    ),
                                  );
                                }}
                              >
                                <option value="">Select product…</option>
                                {mockProducts.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-1 font-mono text-slate-500">
                              {product?.code ?? "–"}
                            </td>
                            <td className="px-2 py-1 text-slate-600">
                              {product?.unit ?? "–"}
                            </td>
                            <td className="px-2 py-1 text-right">
                              <input
                                type="number"
                                min={1}
                                value={line.quantity}
                                onChange={(e) => {
                                  const value = Number(e.target.value) || 0;
                                  setLines((prev) =>
                                    prev.map((l) =>
                                      l.id === line.id
                                        ? { ...l, quantity: value }
                                        : l,
                                    ),
                                  );
                                }}
                                className="w-16 rounded-md border border-slate-200 px-1 py-0.5 text-right outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
                              />
                            </td>
                            <td className="px-2 py-1 text-right">
                              <input
                                type="number"
                                min={0}
                                step={100}
                                value={line.unitCost}
                                onChange={(e) => {
                                  const value = Number(e.target.value) || 0;
                                  setLines((prev) =>
                                    prev.map((l) =>
                                      l.id === line.id
                                        ? { ...l, unitCost: value }
                                        : l,
                                    ),
                                  );
                                }}
                                className="w-20 rounded-md border border-slate-200 px-1 py-0.5 text-right outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
                              />
                            </td>
                            <td className="px-2 py-1 text-right text-slate-800">
                              {lineTotal.toLocaleString()} Tsh
                            </td>
                            <td className="px-2 py-1 text-right">
                              {lines.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setLines((prev) =>
                                      prev.filter((l) => l.id !== line.id),
                                    )
                                  }
                                  className="text-[11px] text-red-500 hover:underline"
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Subtotal (Tsh)
                    </p>
                    <p className="rounded-md border border-slate-100 bg-white px-3 py-2 text-right text-sm text-slate-900">
                      {linesSubtotal.toLocaleString()}{" "}
                      <span className="text-xs text-slate-500">Tsh</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Discount (Tsh)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={discount}
                      onChange={(e) =>
                        setDiscount(Number(e.target.value) || 0)
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      Total (Tsh)
                    </p>
                    <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-right text-sm font-semibold text-emerald-900">
                      {linesTotal.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-emerald-700">
                        Tsh
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Payment type
                  </label>
                  <select className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                    <option value="cash">Cash</option>
                    <option value="mobile">Mobile money</option>
                    <option value="credit">Supplier credit</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700"
                >
                  Save purchase (mock)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
