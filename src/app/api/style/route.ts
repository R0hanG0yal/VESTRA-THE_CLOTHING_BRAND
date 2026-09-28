import { enforceRateLimit, jsonError, readJson } from "@/lib/api";
import { styleSchema } from "@/lib/security/validation";
import { getSkinTone, productsMatchingColors } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "style", 40, 60_000);
  if (limited) return limited;

  const body = await readJson(request, 1_000);
  const parsed = styleSchema.safeParse(body);
  if (!parsed.success) return jsonError("Pick a skin tone to continue.");

  const tone = getSkinTone(parsed.data.toneId);
  if (!tone) return jsonError("Unknown skin tone.", 404);

  const bestNames = tone.best.map((c) => c.name);
  const matches = productsMatchingColors(bestNames)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 24);

  return Response.json(
    {
      tone: { id: tone.id, label: tone.label, hex: tone.hex, undertone: tone.undertone },
      palette: { best: tone.best, avoid: tone.avoid },
      colorQuery: bestNames.join(","),
      productIds: matches.map((p) => p.id),
      total: matches.length,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
