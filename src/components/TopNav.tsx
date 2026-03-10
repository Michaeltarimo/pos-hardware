"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  RectangleStackIcon,
  CubeIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  PowerIcon,
  BuildingStorefrontIcon,
  Cog6ToothIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

type TopNavProps = {
  showLogout?: boolean;
  logoutAction?: () => void;
};

export function TopNav({ showLogout, logoutAction }: TopNavProps) {
  const pathname = usePathname();

  if (pathname === "/auth") {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const baseLinkClasses =
    "inline-flex items-center gap-1 rounded-full px-3 py-1 transition";

  return (
    <header
      className="fixed inset-x-0 top-0 z-20 flex justify-center"
    >
      <div className="mt-4 flex w-[80%] items-center justify-between rounded-full bg-white px-4 py-2 shadow-md ring-1 ring-sky-200 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-xl shadow-md ring-2 ring-sky-300">
            <WrenchScrewdriverIcon className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">
              Tarimo Hardware
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-sky-500">
              POS
            </p>
          </div>
        </div>

        <nav className="flex flex-1 items-center justify-end gap-2 text-xs font-medium text-slate-700">
          <Link
            href="/"
            className={`${baseLinkClasses} ${
              isActive("/")
                ? "bg-sky-700 text-white"
                : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            <HomeIcon className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/pos"
            className={`${baseLinkClasses} ${
              isActive("/pos")
                ? "bg-sky-700 text-white"
                : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            <RectangleStackIcon className="h-4 w-4" />
            <span>POS</span>
          </Link>
          <Link
            href="/products"
            className={`${baseLinkClasses} ${
              isActive("/products")
                ? "bg-sky-700 text-white"
                : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            <CubeIcon className="h-4 w-4" />
            <span>Products</span>
          </Link>
          <Link
            href="/purchases"
            className={`${baseLinkClasses} ${
              isActive("/purchases")
                ? "bg-sky-700 text-white"
                : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Purchases</span>
          </Link>
          <Link
            href="/reports"
            className={`${baseLinkClasses} ${
              isActive("/reports")
                ? "bg-sky-700 text-white"
                : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            <ChartBarIcon className="h-4 w-4" />
            <span>Reports</span>
          </Link>
          <Link
            href="/suppliers"
            className={`${baseLinkClasses} ${
              isActive("/suppliers")
                ? "bg-sky-700 text-white"
                : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            <BuildingStorefrontIcon className="h-4 w-4" />
            <span>Suppliers</span>
          </Link>
          <Link
            href="/debts"
            className={`${baseLinkClasses} ${
              isActive("/debts")
                ? "bg-sky-700 text-white"
                : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            <UserGroupIcon className="h-4 w-4" />
            <span>Debts</span>
          </Link>
          <Link
            href="/settings"
            className={`${baseLinkClasses} ${
              isActive("/settings")
                ? "bg-sky-700 text-white"
                : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
            }`}
          >
            <Cog6ToothIcon className="h-4 w-4" />
            <span>Settings</span>
          </Link>

          {showLogout && logoutAction && (
            <form action={logoutAction} className="ml-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-sky-700"
              >
                <PowerIcon className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}

