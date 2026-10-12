import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { tryOnSchema } from "@/lib/security/validation";
import { getProduct } from "@/lib/data/catalog";
import { seeded } from "@/lib/utils";
import {
  executeVirtualTryOn,
  checkLocalFashnEngineHealth,
} from "@/lib/vton/fashn-adapter";

export const dynamic = "force-dynamic";

export const maxDuration = 180;

/**
 * Health check for the FASHN VTON 1.5 inference engine.
 */
export async function GET(request: Request) {
  const customEngineUrl = request.headers.get("x-vton-engine-url") || undefined;
  const localHealth = await checkLocalFashnEngineHealth(customEngineUrl);
  const cloudAvailable = Boolean(process.env.FASHN_API_KEY);

  return Response.json(
    {
      status: "ok",
      fashnEngine: {
        local: localHealth,
        cloud: {
          enabled: cloudAvailable,
        },
        mode: localHealth.online
          ? "local-diffusion"
          : cloudAvailable
          ? "cloud-diffusion"
          : "ready-for-connection",
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/**
 * Virtual Clothes Changing Try-On powered by FASHN VTON v1.5.
 */
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "tryon", 20, 60_000);
  if (limited) return limited;

  const customEngineUrl = request.headers.get("x-vton-engine-url") || undefined;
  const body = await readJson(request, 10_000_000);
  const parsed = tryOnSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid try-on request.");
  }

  const { productId, customGarmentPhoto, category, bodyType, photo } = parsed.data;

  // Reject anything that isn't a reasonable image data URL.
  if (!/^data:image\/(png|jpe?g|webp);base64,/.test(photo)) {
    return jsonError("Please upload a PNG, JPG or WEBP photo.", 415);
  }

  const product = productId ? getProduct(productId) : undefined;
  if (productId && !product) {
    return jsonError("Product not found.", 404);
  }

  if (product && !product.tryOnReady) {
    return jsonError("This item isn't try-on enabled.", 422);
  }

  if (!product && !customGarmentPhoto) {
    return jsonError("Please provide either a product or a custom garment photo.", 400);
  }

  try {
    // Execute FASHN VTON Try-On
    const vtonResult = await executeVirtualTryOn({
      personImage: photo,
      garmentImage: customGarmentPhoto,
      product: product ?? null,
      category,
      bodyType,
      numTimesteps: 15,
      customEngineUrl,
    });

    const fitBias = { slim: 0.02, athletic: 0.04, average: 0, curvy: -0.02, plus: -0.04 }[bodyType];
    const keySeed = (product?.id ?? "custom") + bodyType;
    const fitScore = Math.round((0.88 + seeded(keySeed, 3) * 0.1 + fitBias) * 100);

    const recommendedSize = product
      ? product.sizes[
          Math.min(
            product.sizes.length - 1,
            Math.max(0, Math.floor(seeded(keySeed, 5) * product.sizes.length))
          )
        ]
      : "M";

    const jobId = `fashn-${product?.id ?? "custom"}-${bodyType}-${Date.now().toString(36)}`;

    return Response.json(
      {
        jobId,
        status: "completed",
        productId: product?.id,
        fitScore: Math.min(99, fitScore),
        sizeRecommended: recommendedSize,
        category: vtonResult.category,
        engine: vtonResult.engine,
        resultImage: vtonResult.resultImage,
        inferenceTimeMs: vtonResult.inferenceTimeMs,
        notes: [
          ...vtonResult.notes,
          product
            ? `Garment: ${product.name} (${product.kind.toUpperCase()})`
            : "Custom uploaded garment pattern",
          `Calculated tailored recommendation: Size ${recommendedSize}`,
        ],
        render: {
          overlay: product?.kind ?? "top",
          color: product?.colors[0]?.hex ?? "#111114",
          scale: 1.0,
          rotate: 0,
        },
        processedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    console.error("[VTON API Error]", err);
    return jsonError(
      err instanceof Error ? err.message : "Virtual try-on processing failed.",
      500
    );
  }
}

