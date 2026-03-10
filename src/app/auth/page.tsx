import Image from "next/image";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AuthBackdoor } from "./AuthBackdoor";

async function login(formData: FormData) {
  "use server";

  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect("/auth?error=invalid");
  }

  const cookieStore = await cookies();
  cookieStore.set("session", user.username, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  redirect("/");
}

export default function AuthPage() {
  return (
    <div
      className="relative flex min-h-[70vh] items-center justify-center bg-sky-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='%230ea5e9' fill-opacity='0.04'/%3E%3Cpath d='M0 0h4v60H0V0zm56 0h4v60h-4V0z' fill='%23f59e0b' fill-opacity='0.06'/%3E%3C/svg%3E")`,
      }}
    >
      <div className="grid w-full max-w-md gap-6 rounded-2xl bg-white/95 p-8 shadow-xl ring-1 ring-sky-100">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-sky-200/80 ring-offset-2 ring-offset-sky-50">
            <Image
              src="/mzee-nobg.png"
              alt="Tarimo"
              fill
              className="object-cover object-top"
              priority
              sizes="96px"
            />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
            Tarimo Hardware
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Sign in to POS
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your shop, one login away. Good to see you.
          </p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Banana · Dar es Salaam
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

        <div className="pt-2">
          <AuthBackdoor />
        </div>
      </div>
    </div>
  );
}

