import fs from "node:fs/promises";
import path from "node:path";
import type { Product } from "@/lib/types";

export type FashnCategory = "tops" | "bottoms" | "one-pieces";

export interface FashnTryOnOptions {
  personImage: string; // Base64 data URL
  garmentImage?: string; // Optional if product is provided
  product?: Product | null;
  category?: FashnCategory;
  bodyType?: string;
  numTimesteps?: number;
}

export interface FashnTryOnResult {
  success: boolean;
  resultImage: string;
  category: FashnCategory;
  engine: "fashn-vton-local" | "fashn-cloud" | "neural-preview";
  inferenceTimeMs: number;
  notes: string[];
  message?: string;
}

/**
 * Maps VESTRA product taxonomy to FASHN VTON 1.5 core categories.
 */
export function mapGarmentKindToFashnCategory(kind: string): FashnCategory {
  const lower = (kind || "").toLowerCase();
  if (lower === "dress") {
    return "one-pieces";
  }
  if (["jeans", "trousers", "skirt", "shorts"].includes(lower)) {
    return "bottoms";
  }
  // tshirt, shirt, hoodie, jacket, top, etc.
  return "tops";
}

/**
 * Loads a product's photographic plate and converts it to a base64 Data URL.
 */
export async function getProductGarmentBase64(product: Product): Promise<string | null> {
  if (!product.image) return null;

  // If already a data URL
  if (product.image.startsWith("data:image/")) {
    return product.image;
  }

  try {
    // Relative to public directory
    const cleanPath = product.image.replace(/^\//, "");
    const fullPath = path.join(process.cwd(), "public", cleanPath);
    const buf = await fs.readFile(fullPath);
    const mime = cleanPath.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch (err) {
    console.warn(`[VTON Adapter] Could not read product image file for ${product.id}:`, err);
    return null;
  }
}

/**
 * Checks if the local FASHN VTON 1.5 microservice is online and healthy.
 */
export async function checkLocalFashnEngineHealth(): Promise<{
  online: boolean;
  weightsReady?: boolean;
  cudaAvailable?: boolean;
  gpuName?: string;
  url: string;
}> {
  const localUrl = process.env.FASHN_VTON_URL || "http://127.0.0.1:8000";
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${localUrl}/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        weightsReady: Boolean(data.weights_exist && data.pipeline_loaded),
        cudaAvailable: Boolean(data.cuda_available),
        gpuName: data.gpu_name,
        url: localUrl,
      };
    }
  } catch {
    // offline or unreachable
  }
  return { online: false, url: localUrl };
}

/**
 * Executes Virtual Try-On using FASHN VTON 1.5:
 * 1. Checks Local FASHN VTON 1.5 Python Microservice.
 * 2. If unavailable, checks FASHN Cloud API (if FASHN_API_KEY is configured).
 * 3. Gracefully falls back to high-fidelity seamless neural preview synthesis.
 */
export async function executeVirtualTryOn({
  personImage,
  garmentImage,
  product,
  category,
  bodyType = "athletic",
  numTimesteps = 30,
}: FashnTryOnOptions): Promise<FashnTryOnResult> {
  const t0 = Date.now();

  // 1. Resolve category
  const resolvedCategory: FashnCategory =
    category || (product ? mapGarmentKindToFashnCategory(product.kind) : "tops");

  // 2. Resolve garment image
  let resolvedGarment = garmentImage;
  if (!resolvedGarment && product) {
    resolvedGarment = (await getProductGarmentBase64(product)) || undefined;
  }

  if (!resolvedGarment) {
    throw new Error("No garment image provided or found for this product.");
  }

  // Determine photo type: catalog photos are worn by models ("model"), flat-lays are standalone ("flat-lay")
  const photoType: "model" | "flat-lay" = product ? "model" : "flat-lay";

  // --- ATTEMPT 1: Local FASHN VTON Microservice ---
  const localBaseUrl = process.env.FASHN_VTON_URL || "http://127.0.0.1:8000";
  try {
    const localRes = await fetch(`${localBaseUrl}/tryon`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        person_image: personImage,
        garment_image: resolvedGarment,
        category: resolvedCategory,
        garment_photo_type: photoType,
        num_timesteps: Math.min(numTimesteps, 25),
        guidance_scale: 1.5,
        segmentation_free: true,
      }),
      // Allow up to 180 seconds for diffusion inference
      signal: AbortSignal.timeout(180_000),
    });

    if (localRes.ok) {
      const data = await localRes.json();
      if (data.result_image) {
        return {
          success: true,
          resultImage: data.result_image,
          category: resolvedCategory,
          engine: "fashn-vton-local",
          inferenceTimeMs: data.inference_time_ms || Date.now() - t0,
          notes: data.notes || [
            `Synthesized via Local FASHN VTON 1.5 MMDiT Engine`,
            `Category: ${resolvedCategory.toUpperCase()}`,
            `Body: ${bodyType.toUpperCase()}`,
          ],
        };
      }
    } else {
      const errData = await localRes.json().catch(() => null);
      if (errData?.detail) {
        throw new Error(errData.detail);
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name !== "AbortError" && !err.message.includes("fetch failed")) {
      throw err;
    }
    console.info("[VTON Adapter] Local FASHN engine not reachable or timed out, checking cloud fallback.");
  }

  // --- ATTEMPT 2: FASHN AI Cloud API (if API Key provided) ---
  const apiKey = process.env.FASHN_API_KEY;
  if (apiKey) {
    try {
      const cloudRes = await fetch("https://api.fashn.ai/v1/run", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_name: "tryon-v1.5",
          inputs: {
            model_image: personImage,
            product_image: resolvedGarment,
            category: resolvedCategory,
            mode: "performance",
          },
        }),
      });

      if (cloudRes.ok) {
        const runData = await cloudRes.json();
        const predId = runData.id;

        // Poll for completion
        let attempts = 0;
        while (attempts < 30) {
          await new Promise((r) => setTimeout(r, 2000));
          const statusRes = await fetch(`https://api.fashn.ai/v1/status/${predId}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
          });
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.status === "completed" && statusData.output?.[0]) {
              return {
                success: true,
                resultImage: statusData.output[0],
                category: resolvedCategory,
                engine: "fashn-cloud",
                inferenceTimeMs: Date.now() - t0,
                notes: [
                  "Synthesized via FASHN Cloud VTON 1.5",
                  `Category: ${resolvedCategory.toUpperCase()}`,
                  `Status: Completed`,
                ],
              };
            }
            if (statusData.status === "failed") {
              throw new Error("FASHN Cloud VTON inference failed.");
            }
          }
          attempts++;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
    }
  }

  // If local engine and cloud are both not ready, fail clearly rather than returning broken composite
  throw new Error(
    "FASHN VTON 1.5 Engine is offline. Start the local server by running 'vton-engine/run_server.bat' or configure FASHN_API_KEY in .env.local."
  );
}
