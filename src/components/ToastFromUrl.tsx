"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Reads toast/error/status from URL and shows a toaster, then clears the params.
 * Use after redirects from server actions (e.g. ?error=invalid, ?status=loggedout).
 * Also supports ?toast=success|error|info&message=... for custom messages.
 */
export function ToastFromUrl() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const shown = useRef<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    const status = searchParams.get("status");
    const toastType = searchParams.get("toast");
    const message = searchParams.get("message");

    const key = [error, status, toastType, message].filter(Boolean).join("|");
    if (!key || shown.current === key) return;
    shown.current = key;

    if (error === "invalid") {
      toast.error("Invalid username or password. Try again.");
    } else if (status === "loggedout") {
      toast.success("Logged out successfully.");
    } else if (status === "invalid") {
      toast.error("Session expired or invalid. Please sign in again.");
    } else if (toastType && message) {
      const decoded = decodeURIComponent(message);
      if (toastType === "success") toast.success(decoded);
      else if (toastType === "error") toast.error(decoded);
      else if (toastType === "info") toast.info(decoded);
      else toast(decoded);
    }

    const next = new URLSearchParams(searchParams);
    next.delete("error");
    next.delete("status");
    next.delete("toast");
    next.delete("message");
    const qs = next.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [searchParams, pathname, router]);

  return null;
}
