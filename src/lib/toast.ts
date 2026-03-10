/**
 * Re-export Sonner toasts for use in client components.
 * For server redirects, use URL params: ?toast=success|error|info&message=...
 * ToastFromUrl in layout will show the toast and clear the params.
 */
export { toast } from "sonner";
