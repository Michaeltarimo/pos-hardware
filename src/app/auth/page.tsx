import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const DEMO_USER = {
  username: "tarimo",
  password: "pos1234",
  role: "ADMIN",
} as const;

async function login(formData: FormData) {
  "use server";

  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (username !== DEMO_USER.username || password !== DEMO_USER.password) {
    redirect("/auth?error=invalid");
  }

  const cookieStore = await cookies();
  cookieStore.set("session", DEMO_USER.username, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  redirect("/");
}

type AuthPageProps = {
  searchParams?: { error?: string; status?: string };
};

export default function AuthPage({ searchParams }: AuthPageProps) {
  const hasError = searchParams?.error === "invalid";
  const loggedOut = searchParams?.status === "loggedout";

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      {loggedOut && (
        <div className="fixed right-4 top-4 z-30 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-xs text-slate-700 shadow-lg">
          <p className="flex items-center gap-2">
            <span className="text-emerald-500">✔</span>
            <span>Logged out successfully.</span>
          </p>
        </div>
      )}
      <div className="grid w-full max-w-md gap-6 rounded-2xl bg-white/95 p-8 shadow-xl ring-1 ring-sky-100">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
            Tarimo Hardware
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Sign in to POS
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Use your admin or cashier account to continue.
          </p>
        </div>

        <form className="space-y-4" action={login}>
          <div className="space-y-1.5 text-sm">
            <label
              htmlFor="username"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="e.g. tarimo"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="space-y-1.5 text-sm">
            <label
              htmlFor="password"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50"
          >
            Sign in
          </button>
        </form>

        {hasError && (
          <p className="text-center text-[11px] font-medium text-red-500">
            Invalid username or password. Try again.
          </p>
        )}

        <p className="text-center text-[11px] text-slate-400">
          Demo login: username <span className="font-mono">tarimo</span>,
          password <span className="font-mono">pos1234</span>.
        </p>
      </div>
    </div>
  );
}

