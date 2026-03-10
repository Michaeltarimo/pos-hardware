"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  PencilSquareIcon,
  TrashIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  deleteCategory,
} from "./actions";

const UNITS = [
  { name: "piece", note: "Single item (e.g. hammer, bulb)" },
  { name: "box", note: "Box with fixed quantity (e.g. nails)" },
  { name: "bag", note: "Bag (e.g. cement, gypsum)" },
  { name: "kg", note: "Kilogram (e.g. loose nails)" },
  { name: "length", note: "Per length (e.g. pipe, timber)" },
  { name: "tin", note: "Tin of paint" },
  { name: "bucket", note: "Bucket (large paint, compound)" },
  { name: "meter", note: "Per meter" },
  { name: "litre", note: "Per litre" },
  { name: "roll", note: "Roll" },
];

const LOW_STOCK_THRESHOLD = 20;

type ProductWithCategory = {
  id: number;
  name: string;
  code: string;
  categoryId: number;
  unit: string;
  packInfo: string | null;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  reorderLevel: number;
  category: { id: number; name: string };
};

type CategoryWithCount = {
  id: number;
  name: string;
  _count: { products: number };
};

type Props = {
  products: ProductWithCategory[];
  categories: CategoryWithCount[];
};

export function ProductsClient({ products: initialProducts, categories: initialCategories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterLowStock = searchParams.get("lowStock") === "1";

  const [view, setView] = useState<"products" | "categories" | "units">("products");
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const [modalMode, setModalMode] = useState<"new-product" | "edit-product" | "new-category" | "new-unit">("new-product");
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);

  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [productUnit, setProductUnit] = useState("");
  const [productPackInfo, setProductPackInfo] = useState("");
  const [productCostPrice, setProductCostPrice] = useState("");
  const [productSellingPrice, setProductSellingPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productReorderLevel, setProductReorderLevel] = useState("20");
  const [categoryName, setCategoryName] = useState("");

  const filteredProducts = useMemo(() => {
    let list = initialProducts;
    if (filterLowStock) {
      list = list.filter((p) => p.stock < LOW_STOCK_THRESHOLD);
    }
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.category.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [initialProducts, filterLowStock, search]);

  const openNewModal = () => {
    if (view === "products") {
      setModalMode("new-product");
      setEditingProduct(null);
      setProductName("");
      setProductCode("");
      setProductCategoryId(initialCategories[0]?.id.toString() ?? "");
      setProductUnit(UNITS[0]?.name ?? "piece");
      setProductPackInfo("");
      setProductCostPrice("");
      setProductSellingPrice("");
      setProductStock("0");
      setProductReorderLevel("20");
    } else if (view === "categories") {
      setModalMode("new-category");
      setCategoryName("");
    } else {
      setModalMode("new-unit");
    }
    setShowModal(true);
  };

  const openEditProduct = (p: ProductWithCategory) => {
    setModalMode("edit-product");
    setEditingProduct(p);
    setProductName(p.name);
    setProductCode(p.code);
    setProductCategoryId(p.categoryId.toString());
    setProductUnit(p.unit);
    setProductPackInfo(p.packInfo ?? "");
    setProductCostPrice(p.costPrice.toString());
    setProductSellingPrice(p.sellingPrice.toString());
    setProductStock(p.stock.toString());
    setProductReorderLevel(p.reorderLevel.toString());
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmitProduct = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("name", productName.trim());
    formData.set("code", productCode.trim());
    formData.set("categoryId", productCategoryId);
    formData.set("unit", productUnit);
    formData.set("packInfo", productPackInfo.trim());
    formData.set("costPrice", productCostPrice);
    formData.set("sellingPrice", productSellingPrice);
    formData.set("stock", productStock);
    formData.set("reorderLevel", productReorderLevel);

    const result = editingProduct
      ? await updateProduct(editingProduct.id, formData)
      : await createProduct(formData);

    if (result.ok) {
      toast.success(editingProduct ? "Product updated." : "Product added.");
      closeModal();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleSubmitCategory = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("name", categoryName.trim());
    const result = await createCategory(formData);
    if (result.ok) {
      toast.success("Category added.");
      closeModal();
      setCategoryName("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const result = await deleteProduct(id);
    if (result.ok) {
      toast.success("Product deleted.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const result = await deleteCategory(id);
    if (result.ok) {
      toast.success("Category deleted.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
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
            onClick={openNewModal}
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
            view === "products" ? "bg-sky-600 text-white shadow-sm" : "hover:bg-slate-100"
          }`}
        >
          Products
        </button>
        <button
          type="button"
          onClick={() => setView("categories")}
          className={`flex-1 rounded-full px-3 py-1 cursor-pointer ${
            view === "categories" ? "bg-sky-600 text-white shadow-sm" : "hover:bg-slate-100"
          }`}
        >
          Categories
        </button>
        <button
          type="button"
          onClick={() => setView("units")}
          className={`flex-1 rounded-full px-3 py-1 cursor-pointer ${
            view === "units" ? "bg-sky-600 text-white shadow-sm" : "hover:bg-slate-100"
          }`}
        >
          Units
        </button>
      </div>

      {view === "products" && (
        <section className="rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Product catalogue</p>
              <p className="text-xs text-slate-500">
                {filterLowStock
                  ? `Showing only low stock (below ${LOW_STOCK_THRESHOLD}). `
                  : ""}
                {initialProducts.length} product(s).
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
                    <th className="px-3 py-2 font-medium text-right">Actions</th>
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
                    <td className="px-3 py-2 text-slate-600">{p.category.name}</td>
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
                      {p.sellingPrice.toLocaleString()} Tsh
                    </td>
                    {editMode && (
                      <td className="px-3 py-2 text-right text-xs">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditProduct(p)}
                            className="inline-flex items-center gap-1 rounded-full border border-sky-200 px-2 py-1 text-[11px] font-medium text-sky-700 hover:bg-sky-50"
                          >
                            <PencilSquareIcon className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
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
              <h3 className="text-sm font-semibold text-slate-800">Categories</h3>
              <p className="text-xs text-slate-500">
                Group products into clear sections for Tarimo.
              </p>
            </div>
            <button
              type="button"
              onClick={openNewModal}
              className="inline-flex items-center gap-1 rounded-full border border-sky-200 px-3 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-50 cursor-pointer"
            >
              <SquaresPlusIcon className="h-3.5 w-3.5" />
              New category
            </button>
          </div>

          <div className="mt-1 space-y-1.5 text-xs">
            {initialCategories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-slate-800">{c.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {c._count.products} product(s)
                  </p>
                </div>
                {editMode && (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(c.id)}
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
                Predefined units for products. New units can be added in a future version.
              </p>
            </div>
          </div>

          <div className="mt-1 space-y-1.5 text-xs">
            {UNITS.map((u) => (
              <div
                key={u.name}
                className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-slate-800">{u.name}</p>
                  <p className="text-[11px] text-slate-500">{u.note}</p>
                </div>
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
                  {modalMode === "new-product"
                    ? "New product"
                    : modalMode === "edit-product"
                    ? "Edit product"
                    : modalMode === "new-category"
                    ? "New category"
                    : "New unit"}
                </h3>
                <p className="text-xs text-slate-500">
                  {modalMode === "new-product" || modalMode === "edit-product"
                    ? "Add or update an item in the catalogue."
                    : modalMode === "new-category"
                    ? "Create a category to group similar products."
                    : "Units are predefined for now."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>

            {(modalMode === "new-product" || modalMode === "edit-product") && (
              <form className="space-y-3 text-sm" onSubmit={handleSubmitProduct}>
                <div className="grid gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Product name
                    </label>
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Code / SKU
                    </label>
                    <input
                      type="text"
                      required
                      value={productCode}
                      onChange={(e) => setProductCode(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Category
                      </label>
                      <select
                        required
                        value={productCategoryId}
                        onChange={(e) => setProductCategoryId(e.target.value)}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      >
                        <option value="">Select category</option>
                        {initialCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Unit
                      </label>
                      <select
                        required
                        value={productUnit}
                        onChange={(e) => setProductUnit(e.target.value)}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      >
                        {UNITS.map((u) => (
                          <option key={u.name} value={u.name}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Pack info (optional)
                    </label>
                    <input
                      type="text"
                      value={productPackInfo}
                      onChange={(e) => setProductPackInfo(e.target.value)}
                      placeholder="e.g. 1 box = 100 pieces"
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Cost price (Tsh)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={productCostPrice}
                        onChange={(e) => setProductCostPrice(e.target.value)}
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
                        value={productSellingPrice}
                        onChange={(e) => setProductSellingPrice(e.target.value)}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Stock
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={productStock}
                        onChange={(e) => setProductStock(e.target.value)}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Reorder level
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={productReorderLevel}
                        onChange={(e) => setProductReorderLevel(e.target.value)}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700 cursor-pointer"
                  >
                    {editingProduct ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            )}

            {modalMode === "new-category" && (
              <form className="space-y-3 text-sm" onSubmit={handleSubmitCategory}>
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Category name
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g. Paint & Finishes"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
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
            )}

            {modalMode === "new-unit" && (
              <p className="text-sm text-slate-600">
                Units are predefined. You can use any of the listed units when creating or editing a product.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
