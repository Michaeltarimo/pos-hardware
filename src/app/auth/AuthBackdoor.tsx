"use client";

import { useState } from "react";

type AuthBackdoorProps = {
  /** Current admin username from DB (so it stays correct after Tarimo changes it). */
  adminUsername: string | null;
};

export function AuthBackdoor({ adminUsername }: AuthBackdoorProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="text-[11px] text-slate-400 underline decoration-slate-300 hover:text-slate-600 hover:decoration-slate-500"
      >
        {show ? "Hide" : "Forgot password?"}
      </button>
      {show && (
        <div className="mt-2 rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-left text-[11px] text-slate-600 space-y-1.5">
          {adminUsername && (
            <p>
              Your username: <span className="font-mono font-medium">{adminUsername}</span>
            </p>
          )}
          <p>
            Your password is the one you set in <strong>Settings</strong>. If you forgot it, run in
            the project folder: <code className="rounded bg-sky-100 px-1 py-0.5">npm run db:seed</code>{" "}
            to reset the admin password to <span className="font-mono font-medium">pos1234</span>.
          </p>
        </div>
      )}
    </div>
  );
}
