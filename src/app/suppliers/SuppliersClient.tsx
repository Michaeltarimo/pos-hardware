"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { createSupplier, updateSupplier, deleteSupplier } from "./actions";

type Supplier = {
  id: number;
  name: string;
  contactName?: string;
  phone?: string;
  location?: string;
  balance: number;
  totalPurchases: number;
  lastPurchaseDate?: string;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "–";
  return new Date(dateStr).toLocaleDateString();
}

type Props = { initialSuppliers: Supplier[] };

export function SuppliersClient({ initialSuppliers }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterWithBalance, setFilterWithBalance] = useState<"all" | "owing">("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const totals = useMemo(() => {
    const totalSuppliers = initialSuppliers.length;
    const owingSuppliers = initialSuppliers.filter((s) => s.balance > 0).length;
    const totalBalance = initialSuppliers.reduce((sum, s) => sum + s.balance, 0);
    return { totalSuppliers, owingSuppliers, totalBalance };
  }, [initialSuppliers]);

  const filteredSuppliers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return initialSuppliers.filter((s) => {
      if (filterWithBalance === "owing" && s.balance <= 0) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.contactName && s.contactName.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q))
      );
    });
  }, [initialSuppliers, search, filterWithBalance]);

  const openNewModal = () => {
    setEditingSupplier(null);
    setName("");
    setContactName("");
    setPhone("");
    setLocation("");
    setShowNewModal(true);
  };

  const openEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setName(s.name);
    setContactName(s.contactName ?? "");
    setPhone(s.phone ?? "");
    setLocation(s.location ?? "");
    setShowNewModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("contactName", contactName.trim());
    formData.set("phone", phone.trim());
    formData.set("location", location.trim());
    if (editingSupplier) {
      const result = await updateSupplier(editingSupplier.id, formData);
      if (result.ok) {
        toast.success("Supplier updated.");
        setShowNewModal(false);
        setEditingSupplier(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await createSupplier(formData);
      if (result.ok) {
        toast.success("Supplier added.");
        setShowNewModal(false);
        setName("");
        setContactName("");
        setPhone("");
        setLocation("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    }
  };

  const handleDelete = async (s: Supplier) => {
    if (!confirm(`Delete "${s.name}"? This cannot be undone.`)) return;
    const result = await deleteSupplier(s.id);
    if (result.ok) {
      toast.success("Supplier deleted.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Suppliers</h2>
          <p className="text-sm text-slate-500">
            Manage companies and people you buy stock from.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewModal}
          className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          + New supplier
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-sky-700">Total suppliers</p>
          <p className="mt-1 text-lg font-semibold text-sky-900">{totals.totalSuppliers}</p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700">Suppliers you still owe</p>
          <p className="mt-1 text-lg font-semibold text-amber-900">{totals.owingSuppliers}</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-xs shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700">Total balance owing</p>
          <p className="mt-1 text-lg font-semibold text-emerald-900">{totals.totalBalance.toLocaleString()} Tsh</p>
        </div>
      </section>

      <section className="rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">Supplier list</p>
            <p className="text-xs text-slate-500">{initialSuppliers.length} supplier(s).</p>
          </div>
          <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, contact, or phone…"
              className="w-full rounded-full border border-slate-200 px-3 py-1.5 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 sm:w-64"
            />
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-50 p-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
              <button
                type="button"
                onClick={() => setFilterWithBalance("all")}
                className={`rounded-full px-3 py-1 ${filterWithBalance === "all" ? "bg-sky-600 text-white shadow-sm" : "hover:bg-slate-100"}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterWithBalance("owing")}
                className={`rounded-full px-3 py-1 ${filterWithBalance === "owing" ? "bg-amber-500 text-white shadow-sm" : "hover:bg-slate-100"}`}
              >
                Owing only
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-100">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Supplier name</th>
                <th className="px-3 py-2 font-medium">Contact person</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Location / address</th>
                <th className="px-3 py-2 text-right font-medium">Balance owing</th>
                <th className="px-3 py-2 text-right font-medium">Total purchases</th>
                <th className="px-3 py-2 text-right font-medium">Last purchase</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((s, idx) => (
                <tr key={s.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40 border-t"}>
                  <td className="px-3 py-2 text-slate-800">{s.name}</td>
                  <td className="px-3 py-2 text-slate-600">{s.contactName || <span className="text-slate-400">–</span>}</td>
                  <td className="px-3 py-2 text-slate-600">{s.phone || <span className="text-slate-400">–</span>}</td>
                  <td className="px-3 py-2 text-slate-600">{s.location || <span className="text-slate-400">–</span>}</td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={`inline-flex items-center justify-end rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        s.balance > 0 ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      }`}
                    >
                      {s.balance > 0 ? `${s.balance.toLocaleString()} Tsh` : "No balance"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-slate-800">{s.totalPurchases.toLocaleString()} Tsh</td>
                  <td className="px-3 py-2 text-right text-slate-600">{formatDate(s.lastPurchaseDate)}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(s)}
                        className="inline-flex items-center gap-1 rounded-full border border-sky-200 px-2 py-1 text-[11px] font-medium text-sky-700 hover:bg-sky-50"
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s)}
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
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-sky-100">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{editingSupplier ? "Edit supplier" : "New supplier"}</h3>
                <p className="text-xs text-slate-500">
                  {editingSupplier ? "Update supplier details." : "Add a supplier Tarimo buys stock from."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowNewModal(false); setEditingSupplier(null); }}
                className="rounded-full px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <form className="space-y-3 text-sm" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Supplier name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Twiga Cement"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Contact person</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Location / address</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kariakoo, main market"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div className="mt-3 flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowNewModal(false); setEditingSupplier(null); }} className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100">
                  Cancel
                </button>
                <button type="submit" className="inline-flex items-center rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700">
                  {editingSupplier ? "Update" : "Save supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
