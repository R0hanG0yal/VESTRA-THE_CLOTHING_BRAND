import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { tryOnSchema } from "@/lib/security/validation";
import { getProduct } from "@/lib/data/catalog";
import { seeded } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const maxDuration = 30;

/**
 * Virtual try-on.
 *
 * The demo returns a deterministic "render" (fit score, drape notes and the
 * garment composite instructions). Wire a real diffusion/segmentation model
 * here (e.g. a garment-transfer model behind a queue) without touching the UI:
 * the response contract stays the same.
 *
 * Privacy: the uploaded image is never persisted or logged — it is processed
 * in-flight and discarded.
 */
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "tryon", 12, 60_000);
  if (limited) return limited;

  const body = await readJson(request, 8_000_000);
  const parsed = tryOnSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid try-on request.");
  }

  const { productId, bodyType, photo } = parsed.data;
  const product = getProduct(productId);
  if (!product) return jsonError("Product not found.", 404);
  if (!product.tryOnReady) return jsonError("This item isn't try-on enabled.", 422);

  // Reject anything that isn't a reasonable image data URL.
  if (!/^data:image\/(png|jpe?g|webp);base64,/.test(photo)) {
    return jsonError("Please upload a PNG, JPG or WEBP photo.", 415);
  }

  const fitBias = { slim: 0.02, athletic: 0.04, average: 0, curvy: -0.02, plus: -0.04 }[bodyType];
  const fitScore = Math.round(
    (0.86 + seeded(product.id + bodyType, 3) * 0.12 + fitBias) * 100,
  );

  const jobId = `try-${product.id}-${bodyType}-${Math.floor(seeded(photo.length.toString(), 7) * 1e6)}`;

  return Response.json(
    {
      jobId,
      status: "completed",
      productId: product.id,
      fitScore: Math.min(99, fitScore),
      sizeRecommended:
        product.sizes[
          Math.min(
            product.sizes.length - 1,
            Math.max(0, Math.floor(seeded(product.id + bodyType, 5) * product.sizes.length)),
          )
        ],
      notes: [
        `Draped for a ${bodyType} silhouette`,
        `Colour ${product.colors[0].name} reads true on this lighting`,
        `Length sits ${seeded(product.id, 9) > 0.5 ? "just above" : "at"} the hip`,
      ],
      render: {
        // The client composites these onto the uploaded photo.
        overlay: product.kind,
        color: product.colors[0].hex,
        scale: 0.94 + seeded(product.id, 11) * 0.1,
        rotate: (seeded(product.id, 12) - 0.5) * 6,
      },
      processedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
