"use client";

import { useMemo, useRef, useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

type PosProduct = {
  id: number;
  name: string;
  code: string;
  unit: string;
  price: number;
};

const mockPosProducts: PosProduct[] = [
  {
    id: 1,
    name: "Cement 50kg",
    code: "CM-50KG",
    unit: "bag",
    price: 17000,
  },
  {
    id: 2,
    name: "Cement 25kg",
    code: "CM-25KG",
    unit: "bag",
    price: 9500,
  },
  {
    id: 3,
    name: "3-inch Nails (Box of 100)",
    code: "NL-3IN-100",
    unit: "box",
    price: 6500,
  },
  {
    id: 4,
    name: "4-inch Nails (Box of 100)",
    code: "NL-4IN-100",
    unit: "box",
    price: 7000,
  },
  {
    id: 5,
    name: "Roofing Nails (1kg)",
    code: "NL-RF-1KG",
    unit: "kg",
    price: 8500,
  },
  {
    id: 6,
    name: "Bulb LED 9W",
    code: "EL-BLB-9W",
    unit: "piece",
    price: 3000,
  },
  {
    id: 7,
    name: "Bulb LED 12W",
    code: "EL-BLB-12W",
    unit: "piece",
    price: 3800,
  },
  {
    id: 8,
    name: "Single Switch – White",
    code: "EL-SW-1G",
    unit: "piece",
    price: 2500,
  },
  {
    id: 9,
    name: "Double Socket – White",
    code: "EL-SK-2G",
    unit: "piece",
    price: 6500,
  },
  {
    id: 10,
    name: "Hammer – Steel Handle",
    code: "HM-STL",
    unit: "piece",
    price: 12000,
  },
  {
    id: 11,
    name: "Measuring Tape 5m",
    code: "TP-5M",
    unit: "piece",
    price: 9000,
  },
  {
    id: 12,
    name: 'PVC Pipe 1" (3m)',
    code: "PV-1IN-3M",
    unit: "length",
    price: 5000,
  },
  {
    id: 13,
    name: "PVC Elbow 1\"",
    code: "PV-EL-1IN",
    unit: "piece",
    price: 1500,
  },
  {
    id: 14,
    name: "White Emulsion Paint 20L",
    code: "PT-WH-20L",
    unit: "bucket",
    price: 42000,
  },
  {
    id: 15,
    name: "Gloss Paint Black 4L",
    code: "PT-GL-BLK-4L",
    unit: "tin",
    price: 21000,
  },
  {
    id: 16,
    name: "Safety Helmet",
    code: "SF-HELM",
    unit: "piece",
    price: 15000,
  },
];

type CartLine = {
  id: number;
  product: PosProduct;
  quantity: number;
  price: number;
};

export default function PosPage() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);
  const [amountReceived, setAmountReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const cartRef = useRef<HTMLDivElement | null>(null);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return mockPosProducts;
    return mockPosProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
    );
  }, [search]);

  const handleAddToCart = (product: PosProduct) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id
            ? { ...l, quantity: l.quantity + 1 }
            : l,
        );
      }
      return [
        ...prev,
        {
          id: Date.now(),
          product,
          quantity: 1,
          price: product.price,
        },
      ];
    });
  };

  const handleQuantityChange = (lineId: number, value: number) => {
    const intValue = Number.isFinite(value) ? Math.floor(value) : 1;
    const safeValue = intValue > 0 ? intValue : 1;
    setCart((prev) =>
      prev.map((l) =>
        l.id === lineId ? { ...l, quantity: safeValue } : l,
      ),
    );
  };

  const handleRemoveLine = (lineId: number) => {
    setCart((prev) => prev.filter((l) => l.id !== lineId));
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, l) => sum + l.quantity * l.price, 0),
    [cart],
  );
  const total = Math.max(subtotal - discount, 0);
  const change = Math.max(amountReceived - total, 0);
  const debt = Math.max(total - amountReceived, 0);

  const resetSale = () => {
    setCart([]);
    setDiscount(0);
    setAmountReceived(0);
  };

  const handleCompleteSale = () => {
    if (cart.length === 0 || total <= 0) return;
    if (debt > 0) {
      setShowDebtModal(true);
    } else {
      // Mock completion with no debt.
      resetSale();
    }
  };

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">POS</h2>
          <p className="text-sm text-slate-500">
            Create a new sale for a customer.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <button
            type="button"
            onClick={() =>
              cartRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
            className="relative flex cursor-pointer items-center justify-center rounded-full bg-sky-600 px-3 py-1.5 text-white shadow-md ring-2 ring-sky-300 transition hover:bg-sky-700"
          >
            <ShoppingCartIcon className="h-4 w-4 animate-pulse" />
            {cart.length > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {cart.length}
              </span>
            )}
          </button>
          <p>Today&apos;s date: {new Date().toLocaleDateString()}</p>
        </div>
      </header>

      <div className="space-y-4">
        <section className="flex flex-col gap-3 rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Search product
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type name or code…"
              className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="flex-1 overflow-hidden rounded-lg border border-slate-100">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium">Unit</th>
                  <th className="px-3 py-2 text-right font-medium">Price</th>
                  <th className="px-3 py-2 text-right font-medium">Add</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/60 border-t"
                    }
                  >
                    <td className="px-3 py-2 text-slate-800">{p.name}</td>
                    <td className="px-3 py-2 font-mono text-slate-500">
                      {p.code}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{p.unit}</td>
                    <td className="px-3 py-2 text-right text-slate-800">
                      {p.price.toLocaleString()} Tsh
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p)}
                        className="cursor-pointer rounded-full bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200 hover:bg-sky-100"
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
            <p className="text-xs font-semibold text-slate-700">
              Current sale
            </p>
            <p className="text-[11px] text-slate-500">
              {cart.length} line(s) ·{" "}
              {subtotal.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{" "}
              Tsh before discount
            </p>
          </div>
        </section>

        {/* Cart + payment */}
        <section
          ref={cartRef}
          className="flex flex-col gap-3 rounded-lg border border-sky-300 bg-white p-4 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-slate-800">Cart</h3>
          <div className="flex-1 overflow-hidden rounded-md border border-slate-100">
            {cart.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-xs text-slate-400">
                No items yet. Search and add a product from the left.
              </div>
            ) : (
              <table className="min-w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-2 py-1.5 font-medium">Item</th>
                    <th className="px-2 py-1.5 text-right font-medium">
                      Qty
                    </th>
                    <th className="px-2 py-1.5 text-right font-medium">
                      Price
                    </th>
                    <th className="px-2 py-1.5 text-right font-medium">
                      Total
                    </th>
                    <th className="px-2 py-1.5 text-right font-medium">
                      .
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((line) => (
                    <tr key={line.id} className="border-t bg-white">
                      <td className="px-2 py-1.5 text-[11px] text-slate-800">
                        <p className="truncate">{line.product.name}</p>
                        <p className="font-mono text-[10px] text-slate-400">
                          {line.product.code}
                        </p>
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={line.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              line.id,
                              Number(e.target.value),
                            )
                          }
                          className="w-16 rounded-md border border-slate-200 px-1.5 py-1 text-right text-xs outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-right text-xs text-slate-700">
                        {line.price.toLocaleString()} Tsh
                      </td>
                      <td className="px-2 py-1.5 text-right text-xs font-semibold text-slate-900">
                        {(line.price * line.quantity).toLocaleString()} Tsh
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          className="cursor-pointer rounded-full px-2 py-1 text-[11px] text-red-500 hover:bg-red-50"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-800">
                {subtotal.toLocaleString()} Tsh
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600">Discount</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-24 rounded-md border border-slate-200 px-2 py-1 text-right text-xs outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
                />
                <span className="text-slate-500">Tsh</span>
              </div>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-700">
              <span className="text-xs font-semibold">Total</span>
              <span className="text-sm font-semibold text-slate-900">
                {total.toLocaleString()} Tsh
              </span>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <label className="text-slate-600">Payment method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-32 rounded-md border border-slate-200 px-2 py-1 text-xs outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
              >
                <option value="cash">Cash</option>
                <option value="mobile">Mobile money</option>
              </select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-slate-600">Amount received</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={amountReceived}
                  onChange={(e) =>
                    setAmountReceived(Number(e.target.value) || 0)
                  }
                  className="w-28 rounded-md border border-slate-200 px-2 py-1 text-right text-xs outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-100"
                />
                <span className="text-slate-500">Tsh</span>
              </div>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Change</span>
              <span className="font-semibold text-emerald-700">
                {change.toLocaleString()} Tsh
              </span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Debt (unpaid)</span>
              <span
                className={`font-semibold ${
                  debt > 0 ? "text-red-600" : "text-slate-500"
                }`}
              >
                {debt.toLocaleString()} Tsh
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={cart.length === 0}
            className="mt-1 inline-flex cursor-pointer items-center justify-center rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            onClick={handleCompleteSale}
          >
            Complete sale (mock)
          </button>
        </section>
      </div>

      {showDebtModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-sky-100">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Record customer debt
                </h3>
                <p className="text-[11px] text-slate-500">
                  This customer is paying less than the total. Save their
                  details so we can track what they owe.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDebtModal(false)}
                className="rounded-full px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="mb-3 rounded-lg bg-slate-50 p-3 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Total</span>
                <span className="font-semibold">
                  {total.toLocaleString()} Tsh
                </span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Paid now</span>
                <span className="font-semibold">
                  {amountReceived.toLocaleString()} Tsh
                </span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Debt to track</span>
                <span className="font-semibold text-red-600">
                  {debt.toLocaleString()} Tsh
                </span>
              </div>
            </div>

            <form
              className="space-y-3 text-sm"
              onSubmit={(e) => {
                e.preventDefault();
                // Later: save debt record. For now just reset sale.
                resetSale();
                setCustomerName("");
                setCustomerPhone("");
                setCustomerLocation("");
                setShowDebtModal(false);
              }}
            >
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Customer name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Location (optional)
                    </label>
                    <input
                      type="text"
                      value={customerLocation}
                      onChange={(e) => setCustomerLocation(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDebtModal(false)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700"
                >
                  Save debt (mock)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

