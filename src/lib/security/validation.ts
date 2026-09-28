import { z } from "zod";

/** Shared, strict input schemas — every API route validates against these. */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5)
  .max(160)
  .email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: emailSchema,
  password: passwordSchema,
});

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(60),
  phone: phoneSchema,
  line1: z.string().trim().min(5).max(160),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
});

export const cartItemInputSchema = z.object({
  productId: z.string().regex(/^p\d{3,6}$/, "Invalid product id"),
  size: z.string().trim().min(1).max(12),
  color: z.string().trim().min(1).max(40),
  qty: z.number().int().min(1).max(10),
});

export const couponApplySchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(20),
  items: z.array(cartItemInputSchema).min(1).max(50),
});

export const upiCreateSchema = z.object({
  items: z.array(cartItemInputSchema).min(1).max(50),
  couponCode: z.string().trim().toUpperCase().max(20).optional().or(z.literal("")),
  cardBank: z.enum(["HDFC", "ICICI", "AXIS"]).optional().or(z.literal("")),
  useWallet: z.boolean().default(false),
  /** Wallet amount to redeem. In production read this from the ledger, not the client. */
  walletBalance: z.number().min(0).max(1_000_000).default(0),
  address: addressSchema,
});

export const tryOnSchema = z.object({
  productId: z.string().regex(/^p\d{3,6}$/),
  /** Data URL of the uploaded photo — size capped in the route. */
  photo: z.string().startsWith("data:image/").max(6_000_000),
  bodyType: z.enum(["slim", "athletic", "average", "curvy", "plus"]).default("average"),
});

export const referralSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^VESTRA-[A-Z0-9]{6}$/, "Invalid referral code"),
});

export const styleSchema = z.object({
  toneId: z.enum(["fair", "light", "medium", "olive", "tan", "deep", "rich"]),
});

/* ------------------------------------------------------------------ */
/* Admin schemas                                                      */
/* ------------------------------------------------------------------ */

export const adminLoginSchema = z.object({
  passcode: z.string().min(6).max(128),
});

export const productWriteSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  brand: z.string().trim().min(1).max(40).optional(),
  category: z.string().trim().min(1).max(40).optional(),
  kind: z.string().trim().min(1).max(20).optional(),
  gender: z.enum(["women", "men", "unisex"]).optional(),
  price: z.number().int().min(1).max(1_000_000).optional(),
  mrp: z.number().int().min(1).max(1_000_000).optional(),
  stock: z.number().int().min(0).max(100_000).optional(),
  description: z.string().trim().max(600).optional(),
  image: z.string().trim().max(2048).optional(),
  colors: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(40),
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        tone: z.enum(["warm", "cool", "neutral"]),
      }),
    )
    .max(8)
    .optional(),
  sizes: z.array(z.string().trim().min(1).max(12)).max(20).optional(),
  vibes: z.array(z.string().trim().min(1).max(30)).max(8).optional(),
  occasions: z.array(z.string().trim().min(1).max(30)).max(8).optional(),
  fits: z.array(z.string().trim().min(1).max(20)).max(8).optional(),
  sustainability: z.array(z.string().trim().min(1).max(30)).max(8).optional(),
  tryOnReady: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const couponWriteSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,20}$/, "Use A–Z and 0–9"),
  label: z.string().trim().min(2).max(40),
  type: z.enum(["percent", "flat", "shipping", "bogo"]),
  value: z.number().min(0).max(100_000),
  minOrder: z.number().min(0).max(1_000_000).default(0),
  maxDiscount: z.number().min(0).max(1_000_000).optional(),
  category: z.string().trim().max(40).optional(),
  bank: z.string().trim().max(40).optional(),
  description: z.string().trim().min(3).max(160),
  expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  active: z.boolean().default(true),
});

export const orderStatusSchema = z.object({
  status: z.enum(["placed", "packed", "shipped", "delivered", "cancelled"]),
});

export type CartItemInput = z.infer<typeof cartItemInputSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductWriteInput = z.infer<typeof productWriteSchema>;
export type CouponWriteInput = z.infer<typeof couponWriteSchema>;

/** Helper returning a generic 400 with only safe field messages. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request";
}
