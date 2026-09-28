import "server-only";

export {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  isSupabaseConfigured,
  SITE_URL,
  BRAND_LEGAL_NAME,
  BRAND_NAME,
  SUPPORT_EMAIL,
  GRIEVANCE_EMAIL,
} from "./env-public";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Server-only secrets. Never expose to client bundles. */
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const UPI_PAYEE_VPA = process.env.UPI_PAYEE_VPA ?? "9729309927@ptyes";
export const UPI_PAYEE_NAME = process.env.UPI_PAYEE_NAME ?? "VESTRA Atelier";

/** Placeholder so local demo mode works without configuration. */
const DEFAULT_SIGNING_SECRET = "dev-only-insecure-signing-secret-change-me";
export const PAYMENT_SIGNING_SECRET =
  process.env.PAYMENT_SIGNING_SECRET ?? DEFAULT_SIGNING_SECRET;
export const isDefaultSigningSecret = PAYMENT_SIGNING_SECRET === DEFAULT_SIGNING_SECRET;

/**
 * Shared admin passcode for the /admin area. The default is for local demo use
 * only — production logins are refused while this default is in place.
 */
export const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE ?? "vestra-admin";
export const isDefaultAdminPasscode = !process.env.ADMIN_PASSCODE;

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required server environment variable: ${name}`);
  return value;
}
