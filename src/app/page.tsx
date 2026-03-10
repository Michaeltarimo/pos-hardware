export default function Home() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-slate-500">
            Quick view of Tarimo Hardware POS.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Today&apos;s Sales
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">0.00</p>
          <p className="mt-1 text-xs text-slate-400">
            Will update once we record sales.
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Items in Stock
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
          <p className="mt-1 text-xs text-slate-400">
            After we add products and purchases.
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">
            Low Stock Alerts
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
          <p className="mt-1 text-xs text-slate-400">
            Based on product reorder levels.
          </p>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">
          Getting started
        </h3>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>Add products in the Products page.</li>
          <li>Record stock coming in via Purchases.</li>
          <li>Use the POS screen to sell to customers.</li>
          <li>Check Reports to see sales and stock.</li>
        </ol>
      </section>
    </div>
  );
}
