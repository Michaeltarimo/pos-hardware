"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  PencilSquareIcon,
  TrashIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";

const mockProducts = [
  {
    id: 1,
    name: "3-inch Nails (Box of 100)",
    code: "NL-3IN-100",
    category: "Nails & Fasteners",
    unit: "box",
    stock: 24,
    price: 6500,
  },
  {
    id: 2,
    name: "4-inch Nails (Box of 100)",
    code: "NL-4IN-100",
    category: "Nails & Fasteners",
    unit: "box",
    stock: 18,
    price: 7000,
  },
  {
    id: 3,
    name: "Roofing Nails (1kg)",
    code: "NL-RF-1KG",
    category: "Nails & Fasteners",
    unit: "kg",
    stock: 35,
    price: 8500,
  },
  {
    id: 4,
    name: "Cement 50kg",
    code: "CM-50KG",
    category: "Cement",
    unit: "bag",
    stock: 42,
    price: 17000,
  },
  {
    id: 5,
    name: "Cement 25kg",
    code: "CM-25KG",
    category: "Cement",
    unit: "bag",
    stock: 27,
    price: 9500,
  },
  {
    id: 6,
    name: "White Emulsion Paint 20L",
    code: "PT-WH-20L",
    category: "Paint & Finishes",
    unit: "bucket",
    stock: 12,
    price: 42000,
  },
  {
    id: 7,
    name: "Gloss Paint Black 4L",
    code: "PT-GL-BLK-4L",
    category: "Paint & Finishes",
    unit: "tin",
    stock: 9,
    price: 21000,
  },
  {
    id: 8,
    name: "Hammer – Steel Handle",
    code: "HM-STL",
    category: "Tools",
    unit: "piece",
    stock: 8,
    price: 12000,
  },
  {
    id: 9,
    name: "Measuring Tape 5m",
    code: "TP-5M",
    category: "Tools",
    unit: "piece",
    stock: 15,
    price: 9000,
  },
  {
    id: 10,
    name: "Adjustable Spanner 12\"",
    code: "SP-ADJ-12",
    category: "Tools",
    unit: "piece",
    stock: 6,
    price: 18000,
  },
  {
    id: 11,
    name: "PVC Pipe 1\" (3m)",
    code: "PV-1IN-3M",
    category: "Plumbing",
    unit: "length",
    stock: 60,
    price: 5000,
  },
  {
    id: 12,
    name: "PVC Elbow 1\"",
    code: "PV-EL-1IN",
    category: "Plumbing",
    unit: "piece",
    stock: 90,
    price: 1500,
  },
  {
    id: 13,
    name: "GI Pipe 3/4\" (6m)",
    code: "GI-3Q-6M",
    category: "Plumbing",
    unit: "length",
    stock: 22,
    price: 23000,
  },
  {
    id: 14,
    name: "Single Switch – White",
    code: "EL-SW-1G",
    category: "Electrical",
    unit: "piece",
    stock: 55,
    price: 2500,
  },
  {
    id: 15,
    name: "Double Socket – White",
    code: "EL-SK-2G",
    category: "Electrical",
    unit: "piece",
    stock: 40,
    price: 6500,
  },
  {
    id: 16,
    name: "Bulb LED 9W",
    code: "EL-BLB-9W",
    category: "Electrical",
    unit: "piece",
    stock: 120,
    price: 3000,
  },
];

const mockCategories = [
  { id: 1, name: "Nails & Fasteners", products: 12 },
  { id: 2, name: "Cement", products: 5 },
  { id: 3, name: "Paint & Finishes", products: 18 },
  { id: 4, name: "Tools", products: 27 },
  { id: 5, name: "Plumbing", products: 22 },
  { id: 6, name: "Electrical", products: 34 },
  { id: 7, name: "Safety Gear", products: 9 },
  { id: 8, name: "Timber & Boards", products: 14 },
];

const mockUnits = [
  { id: 1, name: "piece", note: "Single item (e.g. hammer, bulb)" },
  { id: 2, name: "box", note: "Box with fixed quantity (e.g. nails)" },
  { id: 3, name: "bag", note: "Bag (e.g. cement, gypsum)" },
  { id: 4, name: "kg", note: "Kilogram (e.g. loose nails)" },
  { id: 5, name: "length", note: "Per length (e.g. pipe, timber)" },
  { id: 6, name: "tin", note: "Tin of paint" },
  { id: 7, name: "bucket", note: "Bucket (large paint, compound)" },
];

const LOW_STOCK_THRESHOLD = 20;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const filterLowStock = searchParams.get("lowStock") === "1";

  const [view, setView] = useState<"products" | "categories" | "units">(
    "products",
  );
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    let list = mockProducts;
    if (filterLowStock) {
      list = list.filter((p) => p.stock < LOW_STOCK_THRESHOLD);
    }
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
      );
    }
    return list;
  }, [filterLowStock, search]);

  const isProductView = view === "products";
  const isCategoryView = view === "categories";

  const handleOpenNew = () => {
    setShowModal(true);
  };

  const handleSubmitNew = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowModal(false);
  };

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Products</h2>
          <p className="text-sm text-slate-500">
            Manage hardware items, prices, and stock levels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditMode((prev) => !prev)}
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition cursor-pointer ${
              editMode
                ? "bg-sky-50 text-sky-700 ring-1 ring-sky-300"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {editMode ? (
              <>
                <PencilSquareIcon className="mr-1 h-3.5 w-3.5" />
                Editing… (tap to exit)
              </>
            ) : (
              <>
                <PencilSquareIcon className="mr-1 h-3.5 w-3.5" />
                Edit mode
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 cursor-pointer"
          >
            <SquaresPlusIcon className="mr-1 h-4 w-4" />
            {view === "products"
              ? "New product"
              : view === "categories"
              ? "New category"
              : "New unit"}
          </button>
        </div>
      </header>

      <div className="flex items-center gap-2 rounded-full bg-white/70 p-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-sky-100">
        <button
          type="button"
          onClick={() => setView("products")}
          className={`flex-1 rounded-full px-3 py-1 cursor-pointer ${
            view === "products"
              ? "bg-sky-600 text-white shadow-sm"
              : "hover:bg-slate-100"
          }`}
        >
          Products
        </button>
        <button
          type="button"
          onClick={() => setView("categories")}
          className={`flex-1 rounded-full px-3 py-1 cursor-pointer ${
            view === "categories"
              ? "bg-sky-600 text-white shadow-sm"
              : "hover:bg-slate-100"
          }`}
        >
          Categories
        </button>
        <button
          type="button"
          onClick={() => setView("units")}
          className={`flex-1 rounded-full px-3 py-1 cursor-pointer ${
            view === "units"
              ? "bg-sky-600 text-white shadow-sm"
              : "hover:bg-slate-100"
          }`}
        >
          Units
        </button>
      </div>

      {view === "products" && (
        <section className="rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Product catalogue
              </p>
              <p className="text-xs text-slate-500">
                {filterLowStock
                  ? `Showing only low stock (below ${LOW_STOCK_THRESHOLD}). `
                  : ""}
                This is mock data. We&apos;ll connect to the real database
                later.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {filterLowStock && (
                <a
                  href="/products"
                  className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 hover:bg-sky-100"
                >
                  Show all
                </a>
              )}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or code…"
                className="w-full max-w-xs rounded-full border border-slate-200 px-3 py-1.5 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-100">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium text-right">Stock</th>
                  <th className="px-3 py-2 font-medium text-right">Price</th>
                  {editMode && (
                    <th className="px-3 py-2 font-medium text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/40 border-t"
                    }
                  >
                    <td className="px-3 py-2 text-slate-800">{p.name}</td>
                    <td className="px-3 py-2 text-xs font-mono text-slate-500">
                      {p.code}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{p.category}</td>
                    <td
                      className={`px-3 py-2 text-right ${
                        p.stock < LOW_STOCK_THRESHOLD
                          ? "font-semibold text-red-600"
                          : "text-slate-800"
                      }`}
                    >
                      {p.stock} {p.unit}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-800">
                      {p.price.toLocaleString()} Tsh
                    </td>
                    {editMode && (
                      <td className="px-3 py-2 text-right text-xs">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full border border-sky-200 px-2 py-1 text-[11px] font-medium text-sky-700 hover:bg-sky-50"
                          >
                            <PencilSquareIcon className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {view === "categories" && (
        <section className="flex flex-col gap-3 rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Categories
              </h3>
              <p className="text-xs text-slate-500">
                Group products into clear sections for Tarimo.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenNew}
              className="inline-flex items-center gap-1 rounded-full border border-sky-200 px-3 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-50 cursor-pointer"
            >
              <SquaresPlusIcon className="h-3.5 w-3.5" />
              New category
            </button>
          </div>

          <div className="mt-1 space-y-1.5 text-xs">
            {mockCategories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-slate-800">
                    {c.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {c.products} products
                  </p>
                </div>
                {editMode && (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-100 cursor-pointer"
                    >
                      <PencilSquareIcon className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      <TrashIcon className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {view === "units" && (
        <section className="flex flex-col gap-3 rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Units</h3>
              <p className="text-xs text-slate-500">
                Define allowed units that can be used on products.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenNew}
              className="inline-flex items-center gap-1 rounded-full border border-sky-200 px-3 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-50 cursor-pointer"
            >
              <SquaresPlusIcon className="h-3.5 w-3.5" />
              New unit
            </button>
          </div>

          <div className="mt-1 space-y-1.5 text-xs">
            {mockUnits.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-slate-800">
                    {u.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{u.note}</p>
                </div>
                {editMode && (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-100 cursor-pointer"
                    >
                      <PencilSquareIcon className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      <TrashIcon className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      {showModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-sky-100">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {view === "products"
                    ? "New product"
                    : view === "categories"
                    ? "New category"
                    : "New unit"}
                </h3>
                <p className="text-xs text-slate-500">
                  {view === "products"
                    ? "Add a new item to Tarimo's hardware catalogue."
                    : view === "categories"
                    ? "Create a category to group similar products."
                    : "Define a unit that can be reused on many products."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>

            <form className="space-y-3 text-sm" onSubmit={handleSubmitNew}>
              <div className="grid gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {view === "products"
                      ? "Product name"
                      : view === "categories"
                      ? "Category name"
                      : "Unit name"}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                {isProductView ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Code / SKU
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Category
                        </label>
                        <select className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                          <option value="">Select category</option>
                          {mockCategories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Unit
                        </label>
                        <select className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                          <option value="">Select unit</option>
                          {mockUnits.map((u) => (
                            <option key={u.id} value={u.name}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Cost price (Tsh)
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Selling price (Tsh)
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {isCategoryView
                        ? "Description (optional)"
                        : "Notes / abbreviation (optional)"}
                    </label>
                    <textarea
                      rows={3}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

