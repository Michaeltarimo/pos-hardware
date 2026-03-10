"use client";

import { useState } from "react";

type Cashier = {
  id: number;
  name: string;
  username: string;
  role: "CASHIER";
};

const mockCashiers: Cashier[] = [
  { id: 1, name: "Juma (helper)", username: "juma", role: "CASHIER" },
];

export default function SettingsPage() {
  const [accountMessage, setAccountMessage] = useState("");
  const [shopMessage, setShopMessage] = useState("");
  const [cashierMessage, setCashierMessage] = useState("");

  const [username, setUsername] = useState("tarimo");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [shopName, setShopName] = useState("Tarimo Hardware");
  const [shopPhone, setShopPhone] = useState("");
  const [shopAddress, setShopAddress] = useState("");

  const [cashiers, setCashiers] = useState<Cashier[]>(mockCashiers);
  const [newCashierName, setNewCashierName] = useState("");
  const [newCashierUsername, setNewCashierUsername] = useState("");
  const [newCashierPassword, setNewCashierPassword] = useState("");
  const [newCashierConfirm, setNewCashierConfirm] = useState("");

  const [backupMessage, setBackupMessage] = useState("");
  const [restoreMessage, setRestoreMessage] = useState("");
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetDone, setResetDone] = useState(false);

  const mockBackups = [
    { id: "1", label: "Backup 10 Mar 2025, 14:30", date: "2025-03-10T14:30:00" },
    { id: "2", label: "Backup 09 Mar 2025, 18:00", date: "2025-03-09T18:00:00" },
  ];

  const handleSnapshotBackup = () => {
    setBackupMessage("Current state saved as backup (mock). Ready to push to GitHub or keep locally.");
  };

  const handlePushToGitHub = () => {
    setBackupMessage("Backup pushed to GitHub private repo (mock). Configure repo in production.");
  };

  const handleRestoreFromFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.sqlite,.backup";
    input.onchange = () => setRestoreMessage("Restore from file is ready (mock). In production this would load the selected backup.");
    input.click();
  };

  const handleRestoreFromBackup = (id: string) => {
    setRestoreMessage(`Restoring from backup ${id} (mock). In production this would replace current data.`);
  };

  const handleResetSystem = () => {
    if (resetConfirmText !== "RESET") return;
    setResetDone(true);
    setResetConfirmText("");
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setAccountMessage("New passwords do not match.");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setAccountMessage("Password should be at least 6 characters.");
      return;
    }
    setUsername(username.trim() || username);
    setAccountMessage("Account updated (mock). In production this would save to the database.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShopMessage("Shop details saved (mock). Used on receipts and in the app.");
  };

  const handleAddCashier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCashierName.trim() || !newCashierUsername.trim()) {
      setCashierMessage("Name and username are required.");
      return;
    }
    if (newCashierPassword !== newCashierConfirm) {
      setCashierMessage("Passwords do not match.");
      return;
    }
    if (newCashierPassword.length < 6) {
      setCashierMessage("Password should be at least 6 characters.");
      return;
    }
    setCashiers((prev) => [
      ...prev,
      {
        id: Math.max(0, ...prev.map((c) => c.id)) + 1,
        name: newCashierName.trim(),
        username: newCashierUsername.trim().toLowerCase(),
        role: "CASHIER",
      },
    ]);
    setCashierMessage("Cashier added (mock). They can log in and use POS only.");
    setNewCashierName("");
    setNewCashierUsername("");
    setNewCashierPassword("");
    setNewCashierConfirm("");
  };

  const handleRemoveCashier = (id: number) => {
    setCashiers((prev) => prev.filter((c) => c.id !== id));
    setCashierMessage("Cashier removed (mock).");
  };

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-slate-500">
          Account, shop details, and optional cashier for Tarimo Hardware. Not
          distributed — single-shop use.
        </p>
      </header>

      {/* Account: username & password */}
      <section className="rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-slate-800">
          Your account (Admin)
        </h3>
        <p className="mb-4 text-xs text-slate-500">
          Change login username and password. You are the only admin.
        </p>
        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. tarimo"
              className="w-full max-w-xs rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required to change password"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>
          {accountMessage && (
            <p className="text-xs text-emerald-600">{accountMessage}</p>
          )}
          <button
            type="submit"
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            Save account (mock)
          </button>
        </form>
      </section>

      {/* Shop info */}
      <section className="rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-slate-800">
          Shop details
        </h3>
        <p className="mb-4 text-xs text-slate-500">
          Used on receipts and in the app header. Edit to match your shop.
        </p>
        <form onSubmit={handleShopSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Shop name
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Tarimo Hardware"
              className="w-full max-w-md rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Phone
              </label>
              <input
                type="tel"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
                placeholder="e.g. 0712 345 678"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Address / location
              </label>
              <input
                type="text"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                placeholder="e.g. Kariakoo, Dar es Salaam"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>
          {shopMessage && (
            <p className="text-xs text-emerald-600">{shopMessage}</p>
          )}
          <button
            type="submit"
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            Save shop details (mock)
          </button>
        </form>
      </section>

      {/* Cashier account (optional) */}
      <section className="rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-slate-800">
          Cashier account (optional)
        </h3>
        <p className="mb-4 text-xs text-slate-500">
          Add a helper who can only use POS and view their own sales. They
          cannot change prices, stock, or settings.
        </p>

        <form onSubmit={handleAddCashier} className="mb-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Full name
              </label>
              <input
                type="text"
                value={newCashierName}
                onChange={(e) => setNewCashierName(e.target.value)}
                placeholder="e.g. Juma"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Username (login)
              </label>
              <input
                type="text"
                value={newCashierUsername}
                onChange={(e) => setNewCashierUsername(e.target.value)}
                placeholder="e.g. juma"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Password
              </label>
              <input
                type="password"
                value={newCashierPassword}
                onChange={(e) => setNewCashierPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Confirm password
              </label>
              <input
                type="password"
                value={newCashierConfirm}
                onChange={(e) => setNewCashierConfirm(e.target.value)}
                placeholder="Repeat password"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>
          {cashierMessage && (
            <p className="text-xs text-emerald-600">{cashierMessage}</p>
          )}
          <button
            type="submit"
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            Add cashier (mock)
          </button>
        </form>

        {cashiers.length > 0 && (
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-600">
              Current cashiers
            </p>
            <ul className="space-y-2 text-xs">
              {cashiers.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-md border border-slate-100 bg-white px-3 py-2"
                >
                  <div>
                    <span className="font-medium text-slate-800">{c.name}</span>
                    <span className="ml-2 text-slate-500">@{c.username}</span>
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                      Cashier
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                    >
                      Edit password
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCashier(c.id)}
                      className="rounded-full border border-red-200 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Backup & restore */}
      <section className="rounded-lg border border-sky-300 bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-slate-800">
          Backup & restore
        </h3>
        <p className="mb-4 text-xs text-slate-500">
          Snapshot current POS state, send to GitHub (private), or restore from
          a saved backup. Reset clears all data but keeps your admin password.
        </p>

        {/* Snapshot & push */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <p className="mb-1 text-xs font-medium text-slate-700">
              Snapshot current state
            </p>
            <p className="mb-2 text-[11px] text-slate-500">
              Capture products, sales, purchases, suppliers, and settings as a
              single backup.
            </p>
            <button
              type="button"
              onClick={handleSnapshotBackup}
              className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              Save as backup (mock)
            </button>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
            <p className="mb-1 text-xs font-medium text-slate-700">
              Send to GitHub (private)
            </p>
            <p className="mb-2 text-[11px] text-slate-500">
              Push the latest backup to a private repository. Configure repo URL
              when backend is ready.
            </p>
            <button
              type="button"
              onClick={handlePushToGitHub}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Push to GitHub (mock)
            </button>
          </div>
        </div>
        {backupMessage && (
          <p className="mb-4 text-xs text-emerald-600">{backupMessage}</p>
        )}

        {/* Restore */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-medium text-slate-700">
            Restore from backup
          </p>
          <p className="mb-2 text-[11px] text-slate-500">
            Load a previous backup to restore products, sales, and other data.
            Current state will be replaced.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreFromFile}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Choose backup file…
            </button>
          </div>
          <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/40 p-2">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Available backups (mock)
            </p>
            <ul className="space-y-1.5 text-xs">
              {mockBackups.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-md border border-slate-100 bg-white px-2 py-1.5"
                >
                  <span className="text-slate-700">{b.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRestoreFromBackup(b.id)}
                    className="rounded-full border border-sky-200 px-2 py-0.5 text-[11px] font-medium text-sky-700 hover:bg-sky-50"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {restoreMessage && (
            <p className="mt-2 text-xs text-emerald-600">{restoreMessage}</p>
          )}
        </div>

        {/* Reset */}
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
          <p className="mb-1 text-xs font-semibold text-red-800">
            Reset system
          </p>
          <p className="mb-3 text-[11px] text-red-700/90">
            Delete all data (products, sales, purchases, suppliers, debts,
            cashiers). Your admin account and password are kept. This cannot be
            undone.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="Type RESET to confirm"
              className="w-48 rounded-md border border-red-200 bg-white px-2 py-1.5 text-xs outline-none ring-0 focus:border-red-400 focus:ring-1 focus:ring-red-200"
            />
            <button
              type="button"
              onClick={handleResetSystem}
              disabled={resetConfirmText !== "RESET"}
              className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset system (mock)
            </button>
          </div>
          {resetDone && (
            <p className="mt-2 text-xs text-red-700">
              System reset (mock). In production the database would be cleared.
            </p>
          )}
        </div>
      </section>

      {/* Misc */}
      <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <h3 className="mb-1 text-sm font-semibold text-slate-700">
          Other options
        </h3>
        <p className="text-xs text-slate-500">
          Currency is fixed to Tsh for now. Tax and receipt footer can be added
          when you connect a backend.
        </p>
      </section>
    </div>
  );
}
