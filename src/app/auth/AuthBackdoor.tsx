"use client";

import { useState } from "react";

const DEMO_USERNAME = "tarimo";
const DEMO_PASSWORD = "pos1234";

export function AuthBackdoor() {
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
        <p className="mt-2 rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-[11px] text-slate-600">
          Username <span className="font-mono font-medium">{DEMO_USERNAME}</span>
          {" · "}
          Password <span className="font-mono font-medium">{DEMO_PASSWORD}</span>
        </p>
      )}
    </div>
  );
}
