"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname === "/auth") {
    return null;
  }

  return (
    <footer className="fixed inset-x-0 bottom-0 z-10 flex justify-center pb-3 pt-3 text-[11px] text-slate-500 bg-sky-50">
      <div className="flex w-[80%] items-center justify-between">
        <p className="truncate">
          Tarimo Hardware POS · v0.1 · © {year}{" "}
          <a
            href="https://michaeltarimo.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-slate-700 hover:text-black"
          >
            Michael Tarimo
          </a>
        </p>
        <div className="flex items-center gap-2 text-[11px] text-emerald-600">
          <span className="font-medium">System status:</span>
          <span className="font-semibold text-emerald-700">Operational</span>
          <div className="flex items-center gap-1">
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"
              style={{ animationDelay: "160ms" }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"
              style={{ animationDelay: "320ms" }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

