/**
 * Public environment variables safe for client-side inclusion.
 * Absolutely NO server secrets (service role keys, signing secrets, admin passcodes)
 * must ever be exported from this file.
 */

export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(
  NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production" ? "https://vestra.studio" : "http://localhost:3000");

export const BRAND_LEGAL_NAME = "VESTRA ATELIER (DAGEROZ DIGITAL AGENCY)";
export const BRAND_NAME = "VESTRA";
export const BRAND_OWNER = "Rohan Goyal";
export const BRAND_AGENCY = "DAGEROZ digital agency";
export const BRAND_LOCATION = "Jaipur, Rajasthan, India";
export const SUPPORT_EMAIL = "dageroz@gmail.com";
export const GRIEVANCE_EMAIL = "dageroz@gmail.com";
export const PUBLIC_UPI_VPA = "vestra-atelier@ilb";
export const PUBLIC_UPI_PAYEE_NAME = "VESTRA Atelier";

export const CORPORATE_DETAILS = {
  legalName: "VESTRA ATELIER",
  tradeName: "VESTRA",
  owner: "Rohan Goyal",
  agency: "DAGEROZ digital agency",
  establishedIn: "Jaipur, Rajasthan, India",
  cin: "U18101RJ2026PTC398214",
  gstin: "08AABCV8912M1Z4",
  registeredOffice: "Atelier VESTRA, C-Scheme, Jaipur, Rajasthan 302001, India",
  grievanceOfficer: {
    name: "Mr. Rohan Goyal",
    designation: "Founder & Brand Custodian",
    agency: "DAGEROZ digital agency",
    email: "dageroz@gmail.com",
    address: "C-Scheme, Jaipur, Rajasthan 302001, India",
  },
  supportEmail: "dageroz@gmail.com",
};
