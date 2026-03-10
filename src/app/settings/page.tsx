export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-sm text-slate-500">
            Configure Tarimo Hardware POS preferences.
          </p>
        </div>
      </header>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">
          Here we&apos;ll add options like shop details, tax rate, currency, and
          user management.
        </p>
      </section>
    </div>
  );
}

