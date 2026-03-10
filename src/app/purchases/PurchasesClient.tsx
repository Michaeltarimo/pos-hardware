"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { createPurchase, updatePurchaseFull, deletePurchase } from "./actions";
import { createSupplier } from "@/app/suppliers/actions";

type PurchaseLineDisplay = {
  id: number;
  productId: number;
  product: string;
  code: string;
  unit: string;
  quantity: number;
  cost: number;
};

type PurchaseDisplay = {
  id: number;
  supplierId: number;
  date: string;
  supplier: string;
  total: number;
  paymentType: "cash" | "mobile" | "credit";
  items: PurchaseLineDisplay[];
};

type ProductOption = {
  id: number;
  name: string;
  code: string;
  unit: string;
  costPrice: number;
};

type SupplierOption = { id: number; name: string };

type Props = {
  initialPurchases: PurchaseDisplay[];
  products: ProductOption[];
  suppliers: SupplierOption[];
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}

export function PurchasesClient({
  initialPurchases,
  products,
  suppliers,
}: Props) {
  const router = useRouter();
  const [showNewModal, setShowNewModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showQuickSupplier, setShowQuickSupplier] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id?.toString() ?? "");
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentType, setPaymentType] = useState("cash");
  const [lines, setLines] = useState<{ id: number; productId?: number; quantity: number; unitCost: number }[]>([
    { id: 1, productId: undefined, quantity: 1, unitCost: 0 },
  ]);
  const [quickName, setQuickName] = useState("");
  const [quickContact, setQuickContact] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickLocation, setQuickLocation] = useState("");
  const [editingPurchase, setEditingPurchase] = useState<PurchaseDisplay | null>(null);

  const filteredPurchases = useMemo(() => {
    return initialPurchases.filter((p) => {
      const d = new Date(p.date).getTime();
      if (fromDate && d < new Date(fromDate).getTime()) return false;
      if (toDate && d > new Date(toDate).getTime()) return false;
      return true;
    });
  }, [initialPurchases, fromDate, toDate]);

  const totalSpent = useMemo(() => filteredPurchases.reduce((sum, p) => sum + p.total, 0), [filteredPurchases]);
  const todayTotal = useMemo(() => {
    const todayStr = new Date().toDateString();
    return filteredPurchases
      .filter((p) => new Date(p.date).toDateString() === todayStr)
      .reduce((sum, p) => sum + p.total, 0);
  }, [filteredPurchases]);

  const linesSubtotal = useMemo(
    () => lines.reduce((sum, line) => sum + (line.quantity || 0) * (line.unitCost || 0), 0),
    [lines]
  );
  const linesTotal = useMemo(() => Math.max(0, linesSubtotal - (discount || 0)), [linesSubtotal, discount]);

  const handleSubmitPurchase = async (e: FormEvent) => {
    e.preventDefault();
    const sid = Number(supplierId);
    if (!sid) {
      toast.error("Select a supplier.");
      return;
    }
    const payload = lines
      .filter((l) => l.productId != null && l.productId > 0 && l.quantity > 0)
      .map((l) => ({ productId: l.productId!, quantity: l.quantity, unitCost: l.unitCost || 0 }));
    if (editingPurchase) {
      const result = await updatePurchaseFull(editingPurchase.id, sid, purchaseDate, paymentType, payload, discount);
      if (result.ok) {
        toast.success("Purchase updated. Stock reconciled.");
        setShowNewModal(false);
        setEditingPurchase(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await createPurchase(sid, purchaseDate, paymentType, payload, discount);
      if (result.ok) {
        toast.success("Purchase saved. Stock updated.");
        setShowNewModal(false);
        setLines([{ id: 1, productId: undefined, quantity: 1, unitCost: 0 }]);
        setDiscount(0);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    }
  };

  const openNewModal = () => {
    setEditingPurchase(null);
    setSupplierId(suppliers[0]?.id?.toString() ?? "");
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setPaymentType("cash");
    setLines([{ id: 1, productId: undefined, quantity: 1, unitCost: 0 }]);
    setDiscount(0);
    setShowNewModal(true);
  };

  const openEditModal = (p: PurchaseDisplay) => {
    setEditingPurchase(p);
    setSupplierId(p.supplierId.toString());
    setPurchaseDate(new Date(p.date).toISOString().slice(0, 10));
    setPaymentType(p.paymentType);
    setLines(
      p.items.length > 0
        ? p.items.map((item, i) => ({ id: item.id || i + 1, productId: item.productId, quantity: item.quantity, unitCost: item.cost }))
        : [{ id: 1, productId: undefined, quantity: 1, unitCost: 0 }]
    );
    setDiscount(0);
    setShowNewModal(true);
  };

  const handleDeletePurchase = async (p: PurchaseDisplay) => {
    if (!confirm(`Delete this purchase (${formatDate(p.date)} – ${p.total.toLocaleString()} Tsh)? Stock will be reduced.`)) return;
    const result = await deletePurchase(p.id);
    if (result.ok) {
      toast.success("Purchase deleted. Stock reverted.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleQuickAddSupplier = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("name", quickName.trim());
    formData.set("contactName", quickContact.trim());
    formData.set("phone", quickPhone.trim());
    formData.set("location", quickLocation.trim());
    const result = await createSupplier(formData);
    if (result.ok) {
      toast.success("Supplier added. Select them in the dropdown.");
      setShowQuickSupplier(false);
      setQuickName("");
      setQuickContact("");
      setQuickPhone("");
      setQuickLocation("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Purchases</h2>
          <p className="text-sm text-slate-500">Record stock coming in from suppliers.</p>
        </div>
        <button
          type="button"
          onClick={openNewModal}
          className="inline-flex cursor-pointer items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          + New purchase
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-sky-700">Today&apos;s purchases</p>
          <p className="mt-1 text-lg font-semibold text-sky-900">{todayTotal.toLocaleString()} Tsh</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">Filtered total</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{totalSpent.toLocaleString()} Tsh</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700">Number of purchases</p>
          <p className="mt-1 text-lg font-semibold text-emerald-900">{filteredPurchases.length}</p>
        </div>
      </section>

      <section className="rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">Purchase history</p>
            <p className="text-xs text-slate-500">Filter by date range to see past stock in.</p>
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
                <th className="px-3 py-2 text-right font-medium">Items</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
                <th className="px-3 py-2 text-right font-medium">Payment</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((p, idx) => (
                <tr key={p.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40 border-t"}>
                  <td className="px-3 py-2 text-slate-700">{formatDate(p.date)}</td>
                  <td className="px-3 py-2 text-slate-800">{p.supplier}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{p.items.length}</td>
                  <td className="px-3 py-2 text-right text-slate-800">{p.total.toLocaleString()} Tsh</td>
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
                      {p.paymentType === "cash" ? "Cash" : p.paymentType === "mobile" ? "Mobile" : "Credit"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="inline-flex items-center gap-1 rounded-full border border-sky-200 px-2 py-1 text-[11px] font-medium text-sky-700 hover:bg-sky-50"
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePurchase(p)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
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
                <h3 className="text-lg font-semibold text-slate-900">{editingPurchase ? "Edit purchase" : "New purchase"}</h3>
                <p className="text-xs text-slate-500">
                  {editingPurchase ? "Change supplier, date, payment, or line items. Stock will be reconciled." : "Record stock coming in from a supplier. Stock will be updated."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowNewModal(false); setEditingPurchase(null); }}
                className="rounded-full px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <form className="space-y-4 text-sm" onSubmit={handleSubmitPurchase}>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Supplier</label>
                  <div className="flex gap-2">
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    >
                      <option value="">Select supplier…</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowQuickSupplier((prev) => !prev)}
                      className="rounded-full border border-slate-200 px-3 py-2 text-[11px] text-slate-600 hover:bg-slate-50 sm:inline-flex"
                    >
                      {showQuickSupplier ? "Close" : "+ New"}
                    </button>
                  </div>
                  {showQuickSupplier && (
                    <div className="mt-2 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Quick add supplier</p>
                      <form onSubmit={handleQuickAddSupplier} className="grid gap-2 sm:grid-cols-3">
                        <input
                          type="text"
                          value={quickName}
                          onChange={(e) => setQuickName(e.target.value)}
                          placeholder="Supplier name"
                          className="rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                          required
                        />
                        <input
                          type="text"
                          value={quickContact}
                          onChange={(e) => setQuickContact(e.target.value)}
                          placeholder="Contact person"
                          className="rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                        />
                        <input
                          type="text"
                          value={quickPhone}
                          onChange={(e) => setQuickPhone(e.target.value)}
                          placeholder="Phone"
                          className="rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                        />
                        <input
                          type="text"
                          value={quickLocation}
                          onChange={(e) => setQuickLocation(e.target.value)}
                          placeholder="Location"
                          className="rounded-md border border-slate-200 px-2 py-1.5 text-xs sm:col-span-2"
                        />
                        <button
                          type="submit"
                          className="rounded-full bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-sky-700"
                        >
                          Save supplier
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-700">Line items (stock to add)</p>
                  <button
                    type="button"
                    onClick={() =>
                      setLines((prev) => [
                        ...prev,
                        { id: (prev[prev.length - 1]?.id ?? 0) + 1, productId: undefined, quantity: 1, unitCost: 0 },
                      ])
                    }
                    className="rounded-full bg-sky-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-sky-700"
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
                        <th className="px-2 py-1 text-right font-medium">Qty</th>
                        <th className="px-2 py-1 text-right font-medium">Cost / unit</th>
                        <th className="px-2 py-1 text-right font-medium">Line total</th>
                        <th className="px-2 py-1 text-right font-medium">&nbsp;</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => {
                        const product = products.find((p) => p.id === line.productId);
                        const lineTotal = (line.quantity || 0) * (line.unitCost || 0);
                        return (
                          <tr key={line.id} className="border-t last:border-b-0">
                            <td className="px-2 py-1 text-slate-800">
                              <select
                                className="w-full rounded-md border border-slate-200 px-2 py-1 text-[11px] outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
                                value={line.productId ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value ? Number(e.target.value) : undefined;
                                  const selected = products.find((p) => p.id === val);
                                  setLines((prev) =>
                                    prev.map((l) =>
                                      l.id === line.id
                                        ? { ...l, productId: val, unitCost: selected ? selected.costPrice : l.unitCost }
                                        : l
                                    )
                                  );
                                }}
                              >
                                <option value="">Select product…</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-1 font-mono text-slate-500">{product?.code ?? "–"}</td>
                            <td className="px-2 py-1 text-slate-600">{product?.unit ?? "–"}</td>
                            <td className="px-2 py-1 text-right">
                              <input
                                type="number"
                                min={1}
                                value={line.quantity}
                                onChange={(e) =>
                                  setLines((prev) =>
                                    prev.map((l) => (l.id === line.id ? { ...l, quantity: Number(e.target.value) || 0 } : l))
                                  )
                                }
                                className="w-16 rounded-md border border-slate-200 px-1 py-0.5 text-right text-xs outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
                              />
                            </td>
                            <td className="px-2 py-1 text-right">
                              <input
                                type="number"
                                min={0}
                                step={100}
                                value={line.unitCost}
                                onChange={(e) =>
                                  setLines((prev) =>
                                    prev.map((l) => (l.id === line.id ? { ...l, unitCost: Number(e.target.value) || 0 } : l))
                                  )
                                }
                                className="w-20 rounded-md border border-slate-200 px-1 py-0.5 text-right text-xs outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
                              />
                            </td>
                            <td className="px-2 py-1 text-right text-slate-800">{lineTotal.toLocaleString()} Tsh</td>
                            <td className="px-2 py-1 text-right">
                              {lines.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setLines((prev) => prev.filter((l) => l.id !== line.id))}
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
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Subtotal (Tsh)</p>
                    <p className="rounded-md border border-slate-100 bg-white px-3 py-2 text-right text-sm text-slate-900">
                      {linesSubtotal.toLocaleString()} <span className="text-xs text-slate-500">Tsh</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Discount (Tsh)</label>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Total (Tsh)</p>
                    <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-right text-sm font-semibold text-emerald-900">
                      {linesTotal.toLocaleString()} <span className="text-xs font-normal text-emerald-700">Tsh</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Payment type</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="cash">Cash</option>
                    <option value="mobile">Mobile money</option>
                    <option value="credit">Supplier credit</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowNewModal(false); setEditingPurchase(null); }}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700"
                >
                  {editingPurchase ? "Update" : "Save purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
