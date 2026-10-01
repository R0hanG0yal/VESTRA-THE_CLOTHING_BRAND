"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { IconImage } from "@/components/ui/icon-image";
import { ProductImage } from "@/components/product/product-image";
import { useCart } from "@/providers/cart-provider";
import { useToast } from "@/providers/toast-provider";
import { cn, formatINR } from "@/lib/utils";
import { PRODUCTS, getProduct } from "@/lib/data/catalog";
import type { Product } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "error";

interface TryOnResult {
  jobId: string;
  fitScore: number;
  sizeRecommended: string;
  notes: string[];
  render: { overlay: string; color: string; scale: number; rotate: number };
}

const BODY_TYPES = [
  { id: "slim", label: "SLIM SILHOUETTE" },
  { id: "athletic", label: "ATHLETIC BUILD" },
  { id: "average", label: "CLASSIC PROPORTION" },
  { id: "curvy", label: "HOURGLASS" },
  { id: "plus", label: "EXTENDED PROPORTION" },
] as const;

const STEPS = [
  "Detecting body shape and proportions…",
  "Fitting fabric drape and size…",
  "Checking style and fit matching…",
  "Preparing your 3D try-on view…",
];

export function TryOnStudio({
  products = PRODUCTS,
  preselectedProduct,
  initialProductId,
}: {
  products?: Product[];
  preselectedProduct?: Product;
  initialProductId?: string;
}) {
  const { add } = useCart();
  const { push } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const initialP = preselectedProduct ?? (initialProductId ? getProduct(initialProductId) : undefined) ?? products[0] ?? null;

  const [photo, setPhoto] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(initialP);
  const [bodyType, setBodyType] = useState<string>("athletic");
  const [status, setStatus] = useState<Status>("idle");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<TryOnResult | null>(null);
  const [spin, setSpin] = useState(0);
  const dragging = useRef(false);
  const lastX = useRef(0);

  function onFile(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      push({ title: "Please provide a valid JPEG, PNG or WebP plate", variant: "error" });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      push({ title: "Image exceeds 8MB maximum capacity", variant: "error" });
      return;
    }
    setFileName(file.name);
    const r = new FileReader();
    r.onload = () => {
      setPhoto(r.result as string);
      setResult(null);
      setStatus("idle");
    };
    r.readAsDataURL(file);
  }

  async function generate() {
    if (!photo || !selected) {
      push({ title: "Supply portrait plate and select a garment", variant: "error" });
      return;
    }
    setStatus("loading");
    setStep(0);

    const stepInterval = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 700);

    try {
      const res = await fetch("/api/ai/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo,
          productId: selected.id,
          bodyType,
        }),
      });
      clearInterval(stepInterval);
      if (!res.ok) throw new Error("Processing error");
      const data = await res.json();
      setResult(data);
      setStatus("done");
      push({
        title: "Spatial fitting synthesized",
        description: `Fit tolerance score: ${data.fitScore}% · Size ${data.sizeRecommended}`,
        variant: "success",
      });
    } catch {
      clearInterval(stepInterval);
      setStatus("error");
      push({ title: "Virtual drape failed to converge", variant: "error" });
    }
  }

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setSpin((s) => s + dx * 0.5);
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  function addRecommended() {
    if (!selected || !result) return;
    add({
      productId: selected.id,
      name: selected.name,
      price: selected.price,
      mrp: selected.mrp,
      size: result.sizeRecommended,
      color: selected.colors[0].name,
      colorHex: selected.colors[0].hex,
      kind: selected.kind,
      seed: selected.seed,
      image: selected.image,
    });
    push({
      title: "Archived to bag",
      description: `${selected.name} · Size ${result.sizeRecommended}`,
      variant: "success",
    });
  }

  return (
    <div className="grid gap-10 text-left lg:grid-cols-[1fr_400px]">
      {/* Visual Workspace Stage */}
      <div className="text-left">
        <div
          className={cn(
            "relative aspect-[3/4] overflow-hidden border border-foreground/20 bg-surface-muted text-left",
            !photo && "flex items-center justify-start p-8",
          )}
        >
          {!photo ? (
            <div className="flex flex-col items-start gap-4 text-left max-w-md">
              <IconImage type="tryon" size={32} className="border-none" />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 text-left">
                CAPTURE PROTOCOL // INPUT
              </span>
              <h3 className="font-serif text-3xl font-normal text-foreground text-left">
                Upload Full-Body Portrait
              </h3>
              <p className="font-serif text-sm italic text-foreground/65 leading-relaxed text-left">
                Front-facing, well-lit full-length portrait with relaxed arms works best.
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-2 flex items-center gap-2 border border-foreground bg-foreground px-5 py-3 font-mono text-xs uppercase tracking-widest text-background text-left transition hover:opacity-90"
              >
                <span>SELECT PHOTOGRAPHIC FILE</span>
              </button>
              <div className="mt-2 flex items-center gap-2 text-left">
                <IconImage type="shield" size={14} />
                <span className="font-mono text-[9px] uppercase tracking-wider text-foreground/50 text-left">
                  RAM PROCESSED ONLY · ZERO PERMANENT STORAGE
                </span>
              </div>
            </div>
          ) : (
            <div
              className="relative h-full w-full touch-none select-none text-left"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{ perspective: "1200px" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt="Uploaded client full-body plate"
                className="h-full w-full object-contain"
              />

              {status === "done" && result && selected && (
                <div
                  className="pointer-events-none absolute left-1/2 top-[26%] w-[46%] -translate-x-1/2 transition-transform duration-200"
                  style={{
                    transform: `translateX(-50%) rotateY(${spin}deg) rotate(${result.render.rotate}deg) scale(${result.render.scale})`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="aspect-[3/4] opacity-95">
                    <ProductImage
                      kind={selected.kind}
                      color={result.render.color}
                      seed={selected.seed}
                      image={selected.image}
                      alt={selected.name}
                      sizes="46vw"
                    />
                  </div>
                </div>
              )}

              {status === "loading" && (
                <div className="absolute inset-0 flex items-center justify-start bg-black/75 p-8 backdrop-blur-sm text-left">
                  <div className="w-full max-w-sm text-left text-white">
                    <IconImage type="tryon" size={24} className="border-none mb-3" />
                    <p className="font-mono text-xs uppercase tracking-widest font-bold text-white text-left">
                      CREATING 3D FIT PREVIEW…
                    </p>
                    <div className="mt-4 space-y-2 text-left">
                      {STEPS.map((s, i) => (
                        <p
                          key={s}
                          className={cn(
                            "font-serif text-xs italic text-left",
                            i <= step ? "text-white" : "text-white/35",
                          )}
                        >
                          {i <= step ? "[OK] " : "[..] "} {s}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Photo Action Controls */}
              <div className="absolute left-3 top-3 flex gap-2 text-left">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="border border-foreground/30 bg-background/90 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground text-left shadow-sm hover:bg-foreground/5 transition-colors"
                >
                  CHANGE PHOTO
                </button>
                <button
                  onClick={() => {
                    setPhoto(null);
                    setResult(null);
                    setStatus("idle");
                  }}
                  className="border border-foreground/30 bg-background/90 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground text-left shadow-sm hover:bg-foreground/5 transition-colors"
                >
                  CLEAR
                </button>
              </div>

              {status === "done" && (
                <div className="absolute bottom-3 left-3 border border-white/20 bg-black/80 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-white text-left">
                  DRAG LEFT OR RIGHT TO ROTATE 3D VIEW
                </div>
              )}
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />

        {fileName && (
          <p className="mt-2 font-mono text-[10px] uppercase text-foreground/50 text-left">
            REGISTERED FILE: {fileName}
          </p>
        )}

        {/* Fitting Telemetry Output */}
        {status === "done" && result && (
          <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
            <div className="border border-foreground/20 bg-surface p-4 text-left">
              <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/50 text-left">
                FIT TOLERANCE SCORE
              </p>
              <p className="mt-1 font-mono text-3xl font-bold text-foreground text-left">
                {result.fitScore}%
              </p>
            </div>
            <div className="border border-foreground/20 bg-surface p-4 text-left">
              <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/50 text-left">
                CALCULATED SPECIFICATION
              </p>
              <p className="mt-1 font-mono text-3xl font-bold text-foreground text-left">
                SIZE {result.sizeRecommended}
              </p>
            </div>
            <div className="border border-foreground/20 bg-surface p-4 text-left">
              <ul className="space-y-1 font-serif text-xs italic text-foreground/75 text-left">
                {result.notes.map((n) => (
                  <li key={n} className="text-left">
                    · {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Control Configuration Rail */}
      <div className="text-left lg:sticky lg:top-24 lg:self-start">
        <div className="border border-foreground bg-surface p-6 text-left">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/50 text-left block">
            STUDIO PARAMETERS
          </span>
          <h2 className="mt-1 font-serif text-2xl text-foreground text-left">
            Fitting Calibration
          </h2>

          {/* Body Silhouette Specifier */}
          <div className="mt-6 text-left">
            <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/60 text-left mb-2">
              PHYSICAL PROPORTION CATEGORY
            </p>
            <div className="flex flex-wrap gap-1.5 text-left">
              {BODY_TYPES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBodyType(b.id)}
                  className={cn(
                    "border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-left transition",
                    bodyType === b.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/20 hover:border-foreground text-foreground",
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Garment Selector */}
          <div className="mt-6 text-left">
            <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/60 text-left mb-2">
              SELECT GARMENT SILHOUETTE
            </p>
            <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-2 text-left">
              {products.slice(0, 12).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelected(p);
                    setResult(null);
                    setStatus("idle");
                  }}
                  aria-pressed={selected?.id === p.id}
                  className={cn(
                    "w-16 shrink-0 overflow-hidden border transition text-left",
                    selected?.id === p.id ? "border-foreground ring-2 ring-foreground" : "border-foreground/25 hover:border-foreground",
                  )}
                >
                  <div className="aspect-[3/4]">
                    <ProductImage
                      kind={p.kind}
                      color={p.colors[0].hex}
                      seed={p.seed}
                      image={p.image}
                      alt={p.name}
                      sizes="64px"
                    />
                  </div>
                </button>
              ))}
            </div>

            {selected && (
              <div className="mt-3 flex items-start justify-between border border-foreground/15 p-3 text-left">
                <div className="text-left">
                  <p className="font-serif text-sm font-semibold text-foreground text-left">{selected.name}</p>
                  <p className="font-mono text-[10px] uppercase text-foreground/50 text-left">
                    {selected.brand} · {formatINR(selected.price)}
                  </p>
                </div>
                <Link
                  href={`/product/${selected.id}`}
                  className="font-mono text-[10px] uppercase text-foreground underline text-right"
                >
                  [INSPECT]
                </Link>
              </div>
            )}
          </div>

          {/* Generation Trigger */}
          <button
            onClick={generate}
            disabled={status === "loading" || !photo || !selected}
            className="mt-6 flex w-full items-center justify-between border border-foreground bg-foreground px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition hover:opacity-90 disabled:opacity-40 text-left"
          >
            <span>{status === "loading" ? "SYNTHESIZING DRAPE..." : "COMPUTE 3D DRAPE PHYSICS"}</span>
            <IconImage type="arrow" size={14} className="border-none invert dark:invert-0" />
          </button>

          {status === "done" && result && selected && (
            <div className="mt-4 space-y-2 text-left">
              <button
                onClick={addRecommended}
                className="w-full border border-foreground bg-transparent py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background text-left px-4"
              >
                ACQUIRE RECOMMENDED SIZE {result.sizeRecommended}
              </button>
              <Link
                href="/checkout"
                className="flex w-full items-center justify-between border border-foreground bg-foreground py-3 px-4 font-mono text-xs uppercase tracking-widest text-background text-left"
              >
                <span>DIRECT TO CHECKOUT</span>
                <IconImage type="arrow" size={12} className="border-none invert dark:invert-0" />
              </Link>
            </div>
          )}

          <div className="mt-6 flex items-start gap-2 border-t border-foreground/10 pt-4 text-left">
            <IconImage type="shield" size={14} className="mt-0.5" />
            <p className="font-mono text-[9px] uppercase tracking-wider text-foreground/50 leading-relaxed text-left">
              ENCRYPTED IN-TRANSIT · ZERO STORAGE · DISCARDED POST-SESSION.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
