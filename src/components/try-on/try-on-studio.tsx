"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconImage } from "@/components/ui/icon-image";
import { ProductImage } from "@/components/product/product-image";
import { useCart } from "@/providers/cart-provider";
import { useToast } from "@/providers/toast-provider";
import { cn, formatINR } from "@/lib/utils";
import { PRODUCTS, getProduct } from "@/lib/data/catalog";
import type { Product } from "@/lib/types";

type Status = "idle" | "loading" | "done" | "error";
type ViewMode = "result" | "slider" | "before" | "3d";
type GarmentSource = "catalog" | "custom";

interface TryOnResult {
  jobId: string;
  status: string;
  productId?: string;
  fitScore: number;
  sizeRecommended: string;
  category: "tops" | "bottoms" | "one-pieces";
  engine: string;
  resultImage: string;
  inferenceTimeMs: number;
  notes: string[];
  render?: { overlay: string; color: string; scale: number; rotate: number };
}

const BODY_TYPES = [
  { id: "slim", label: "SLIM SILHOUETTE" },
  { id: "athletic", label: "ATHLETIC BUILD" },
  { id: "average", label: "CLASSIC PROPORTION" },
  { id: "curvy", label: "HOURGLASS" },
  { id: "plus", label: "EXTENDED PROPORTION" },
] as const;

const FASHN_CATEGORIES = [
  { id: "tops", label: "TOPS", blurb: "Upper body: shirts, tees, jackets" },
  { id: "bottoms", label: "BOTTOMS", blurb: "Lower body: jeans, trousers, skirts" },
  { id: "one-pieces", label: "ONE-PIECES", blurb: "Full body: dresses, jumpsuits" },
] as const;

const STEPS = [
  "Detecting body pose & keypoints with DWPose…",
  "Segmenting clothing & preserving human identity…",
  "Computing pixel-space fabric drape kinematics…",
  "Synthesizing FASHN VTON 1.5 photorealistic look…",
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
  const customGarmentInputRef = useRef<HTMLInputElement>(null);

  const initialP =
    preselectedProduct ??
    (initialProductId ? getProduct(initialProductId) : undefined) ??
    products[0] ??
    null;

  // State
  const [photo, setPhoto] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(initialP);
  const [garmentSource, setGarmentSource] = useState<GarmentSource>("catalog");
  const [customGarment, setCustomGarment] = useState<string | null>(null);
  const [customGarmentName, setCustomGarmentName] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState<"tops" | "bottoms" | "one-pieces">("tops");
  const [bodyType, setBodyType] = useState<string>("athletic");
  const [status, setStatus] = useState<Status>("idle");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<TryOnResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("result");
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100
  const [engineOnline, setEngineOnline] = useState<boolean | null>(null);
  const [showEngineModal, setShowEngineModal] = useState(false);

  // 3D Motion state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderDragging = useRef(false);

  // Check engine health on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("/api/ai/tryon");
        if (res.ok) {
          const data = await res.json();
          setEngineOnline(data?.fashnEngine?.local?.online || data?.fashnEngine?.cloud?.enabled || true);
        }
      } catch {
        setEngineOnline(false);
      }
    }
    checkHealth();
  }, []);

  function onUserPhoto(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      push({ title: "Please provide a valid JPEG, PNG or WebP portrait", variant: "error" });
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

  function onCustomGarment(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      push({ title: "Please provide a valid image of the garment", variant: "error" });
      return;
    }
    setCustomGarmentName(file.name);
    const r = new FileReader();
    r.onload = () => {
      setCustomGarment(r.result as string);
      setResult(null);
      setStatus("idle");
    };
    r.readAsDataURL(file);
  }

  async function generate() {
    if (!photo) {
      push({ title: "Please upload your portrait photograph first", variant: "error" });
      return;
    }

    if (garmentSource === "catalog" && !selected) {
      push({ title: "Select a garment from the atelier catalog", variant: "error" });
      return;
    }

    if (garmentSource === "custom" && !customGarment) {
      push({ title: "Upload a garment photo to try on", variant: "error" });
      return;
    }

    setStatus("loading");
    setStep(0);

    const stepInterval = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 7500);

    try {
      const payload: Record<string, unknown> = {
        photo,
        bodyType,
      };

      if (garmentSource === "catalog" && selected) {
        payload.productId = selected.id;
      } else {
        payload.customGarmentPhoto = customGarment;
        payload.category = customCategory;
      }

      const res = await fetch("/api/ai/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      clearInterval(stepInterval);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Virtual try-on processing failed");
      }

      const data: TryOnResult = await res.json();
      setResult(data);
      setStatus("done");
      setViewMode("result");

      push({
        title: "Virtual Clothes Changed Successfully",
        description: `FASHN VTON fit score: ${data.fitScore}% · Size ${data.sizeRecommended}`,
        variant: "success",
      });
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setStatus("error");
      push({
        title: "Virtual drape failed to converge",
        description: err instanceof Error ? err.message : "Please try again with a clear photo.",
        variant: "error",
      });
    }
  }

  // Slider dragging handlers
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  }, []);

  const onPointerDownSlider = (e: React.PointerEvent) => {
    sliderDragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    handleSliderMove(e.clientX);
  };

  const onPointerMoveSlider = (e: React.PointerEvent) => {
    if (sliderDragging.current) {
      handleSliderMove(e.clientX);
    }
  };

  const onPointerUpSlider = () => {
    sliderDragging.current = false;
  };

  // 3D Tilt handlers
  const on3DPointerMove = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 14, y: -py * 14 });
  }, []);

  const on3DPointerLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  function downloadResult() {
    if (!result?.resultImage) return;
    const link = document.createElement("a");
    link.href = result.resultImage;
    link.download = `vestra-fashn-tryon-${Date.now()}.png`;
    link.click();
    push({ title: "Try-on portrait downloaded", variant: "success" });
  }

  function addRecommended() {
    if (!result) return;
    const targetProduct = selected ?? products[0];
    if (!targetProduct) return;

    add({
      productId: targetProduct.id,
      name: targetProduct.name,
      price: targetProduct.price,
      mrp: targetProduct.mrp,
      size: result.sizeRecommended,
      color: targetProduct.colors[0].name,
      colorHex: targetProduct.colors[0].hex,
      kind: targetProduct.kind,
      seed: targetProduct.seed,
      image: targetProduct.image,
    });
    push({
      title: "Archived to bag",
      description: `${targetProduct.name} · Tailored Size ${result.sizeRecommended}`,
      variant: "success",
    });
  }

  return (
    <div className="grid gap-10 text-left lg:grid-cols-[1fr_420px]">
      {/* Visual Workspace Stage */}
      <div className="text-left">
        {/* Engine Header Status Bar */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-foreground/15 pb-2 text-left">
          <div className="flex items-center gap-2 text-left">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
              FASHN VTON v1.5 ENGINE
            </span>
            <span className="font-mono text-[9px] text-foreground/50 border border-foreground/20 px-1.5 py-0.5">
              PIXEL SPACE · MASKLESS
            </span>
          </div>

          <button
            onClick={() => setShowEngineModal(!showEngineModal)}
            className="font-mono text-[10px] uppercase text-foreground/60 hover:text-foreground underline"
          >
            {engineOnline ? "[LOCAL / CLOUD READY]" : "[ENGINE INFO]"}
          </button>
        </div>

        {/* Engine Info Dropdown */}
        {showEngineModal && (
          <div className="mb-4 border border-foreground/25 bg-surface p-4 text-xs font-mono text-foreground space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                ● FASHN VTON v1.5 ARCHITECTURE
              </span>
              <button
                onClick={() => setShowEngineModal(false)}
                className="text-foreground/50 hover:text-foreground"
              >
                [CLOSE]
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-foreground/80 font-sans">
              Unlike legacy systems that paste 2D stickers over your photo, FASHN VTON 1.5 runs a
              multimodal diffusion transformer (MMDiT) in pixel space. It segments original clothing, detects
              body landmarks with DWPose, and generates a photorealistic dressed image preserving body identity.
            </p>
            <div className="pt-2 border-t border-foreground/15 flex flex-wrap gap-2 text-[10px]">
              <span className="bg-surface-muted px-2 py-1">Local Server: http://127.0.0.1:8000</span>
              <span className="bg-surface-muted px-2 py-1">Command: run_server.bat</span>
              <span className="bg-surface-muted px-2 py-1">RTX GPU / CPU Accelerated</span>
            </div>
          </div>
        )}

        {/* Primary Stage Box */}
        <div
          ref={containerRef}
          className={cn(
            "relative aspect-[3/4] overflow-hidden border border-foreground/20 bg-surface-muted text-left select-none",
            !photo && "flex items-center justify-start p-8",
          )}
          onPointerMove={viewMode === "3d" ? on3DPointerMove : undefined}
          onPointerLeave={viewMode === "3d" ? on3DPointerLeave : undefined}
        >
          {!photo ? (
            <div className="flex flex-col items-start gap-4 text-left max-w-md">
              <IconImage type="tryon" size={36} className="border-none" />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 text-left">
                INPUT STAGE // PROTOCOL
              </span>
              <h3 className="font-serif text-3xl font-normal text-foreground text-left">
                Upload Full-Body Portrait
              </h3>
              <p className="font-serif text-sm italic text-foreground/75 leading-relaxed text-left">
                Front-facing, well-lit portrait photo with relaxed arms works best for fabric drape
                synthesis.
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-2 flex items-center gap-2 border border-foreground bg-foreground px-5 py-3 font-mono text-xs uppercase tracking-widest text-background text-left transition hover:opacity-90"
              >
                <span>SELECT PORTRAIT PHOTO</span>
              </button>
              <div className="mt-2 flex items-center gap-2 text-left">
                <IconImage type="shield" size={14} />
                <span className="font-mono text-[9px] uppercase tracking-wider text-foreground/50 text-left">
                  RAM PROCESSED ONLY · ZERO PERMANENT CLOUD STORAGE
                </span>
              </div>
            </div>
          ) : (
            <div className="relative h-full w-full touch-none select-none text-left">
              {/* VIEW MODE: 3D VOLUMETRIC TILT */}
              {status === "done" && result && viewMode === "3d" ? (
                <div
                  className="relative h-full w-full overflow-hidden transition-transform duration-100 ease-out"
                  style={{
                    perspective: "1000px",
                    transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.resultImage || photo}
                    alt="Synthesized 3D Fitted Portrait"
                    className="h-full w-full object-contain"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                    style={{
                      transform: `translateX(${tilt.x * 2}px) translateY(${tilt.y * 2}px)`,
                    }}
                  />
                </div>
              ) : status === "done" && result && viewMode === "slider" ? (
                /* VIEW MODE: INTERACTIVE BEFORE/AFTER WIPE SLIDER */
                <div
                  className="relative h-full w-full overflow-hidden cursor-ew-resize"
                  onPointerDown={onPointerDownSlider}
                  onPointerMove={onPointerMoveSlider}
                  onPointerUp={onPointerUpSlider}
                >
                  {/* Background (After / Dressed Image) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.resultImage || photo}
                    alt="Fitted virtual look"
                    className="absolute inset-0 h-full w-full object-contain"
                  />

                  {/* Foreground (Before / Original Image), clipped to sliderPos */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPos}%` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt="Original look"
                      className="absolute inset-0 h-full w-full object-contain max-w-none"
                      style={{
                        width: containerRef.current?.clientWidth || "100%",
                        height: containerRef.current?.clientHeight || "100%",
                      }}
                    />
                  </div>

                  {/* Slider Divider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)]"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-black bg-white text-[10px] font-bold text-black shadow-lg">
                      ⇄
                    </div>
                  </div>

                  <div className="absolute top-3 left-3 bg-black/75 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-white">
                    BEFORE (ORIGINAL)
                  </div>
                  <div className="absolute top-3 right-3 bg-black/75 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-white">
                    AFTER (FASHN VTON)
                  </div>
                </div>
              ) : status === "done" && result && viewMode === "before" ? (
                /* VIEW MODE: BEFORE ONLY */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={photo}
                  alt="Original client portrait"
                  className="h-full w-full object-contain"
                />
              ) : (
                /* VIEW MODE: RESULT (DEFAULT AFTER) OR PRE-PROCESSING */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={status === "done" && result?.resultImage ? result.resultImage : photo}
                  alt="Virtual try-on preview"
                  className="h-full w-full object-contain"
                />
              )}

              {/* Loading AI State */}
              {status === "loading" && (
                <div className="absolute inset-0 flex items-center justify-start bg-black/80 p-8 backdrop-blur-md text-left">
                  <div className="w-full max-w-sm text-left text-white">
                    <IconImage type="tryon" size={26} className="border-none mb-3" />
                    <p className="font-mono text-xs uppercase tracking-widest font-bold text-white text-left">
                      FASHN VTON 1.5 DRAPING IN PROGRESS…
                    </p>
                    <div className="mt-4 space-y-2 text-left">
                      {STEPS.map((s, i) => (
                        <p
                          key={s}
                          className={cn(
                            "font-serif text-xs italic text-left transition-colors",
                            i <= step ? "text-emerald-400" : "text-white/30",
                          )}
                        >
                          {i <= step ? "✓ " : "· "} {s}
                        </p>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center gap-2 border-t border-white/20 pt-3">
                      <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                      <span className="font-mono text-[9px] uppercase text-white/60 tracking-wider">
                        Running maskless pixel-space transformer
                      </span>
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

              {/* Completed Look Mode Toggles */}
              {status === "done" && result && (
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 border border-white/20 bg-black/85 p-2 text-white">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setViewMode("result")}
                      className={cn(
                        "px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider transition",
                        viewMode === "result"
                          ? "bg-white text-black font-bold"
                          : "text-white/70 hover:text-white",
                      )}
                    >
                      DRESSED LOOK
                    </button>
                    <button
                      onClick={() => setViewMode("slider")}
                      className={cn(
                        "px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider transition",
                        viewMode === "slider"
                          ? "bg-white text-black font-bold"
                          : "text-white/70 hover:text-white",
                      )}
                    >
                      BEFORE / AFTER WIPE
                    </button>
                    <button
                      onClick={() => setViewMode("3d")}
                      className={cn(
                        "px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider transition",
                        viewMode === "3d"
                          ? "bg-white text-black font-bold"
                          : "text-white/70 hover:text-white",
                      )}
                    >
                      3D TILT
                    </button>
                    <button
                      onClick={() => setViewMode("before")}
                      className={cn(
                        "px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider transition",
                        viewMode === "before"
                          ? "bg-white text-black font-bold"
                          : "text-white/70 hover:text-white",
                      )}
                    >
                      ORIGINAL
                    </button>
                  </div>

                  <button
                    onClick={downloadResult}
                    className="border border-white/30 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider hover:bg-white hover:text-black transition"
                  >
                    DOWNLOAD LOOK
                  </button>
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
          onChange={(e) => onUserPhoto(e.target.files?.[0])}
        />
        <input
          ref={customGarmentInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => onCustomGarment(e.target.files?.[0])}
        />

        {fileName && (
          <p className="mt-2 font-mono text-[10px] uppercase text-foreground/50 text-left">
            REGISTERED PORTRAIT: {fileName}
          </p>
        )}

        {/* Fitting Telemetry Output */}
        {status === "done" && result && (
          <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
            <div className="border border-foreground/20 bg-surface p-4 text-left">
              <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/50 text-left">
                FASHN FIT SCORE
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
              <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/50 text-left">
                DIFFUSION TELEMETRY
              </p>
              <ul className="mt-1 space-y-1 font-serif text-xs italic text-foreground/75 text-left">
                {result.notes.slice(0, 3).map((n) => (
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
            Garment Changing Studio
          </h2>

          {/* Garment Source Tabs */}
          <div className="mt-5 grid grid-cols-2 border border-foreground/20 text-left">
            <button
              onClick={() => setGarmentSource("catalog")}
              className={cn(
                "py-2 font-mono text-[10px] uppercase tracking-wider text-center transition",
                garmentSource === "catalog"
                  ? "bg-foreground text-background font-bold"
                  : "bg-surface text-foreground/70 hover:text-foreground",
              )}
            >
              ATELIER CATALOG
            </button>
            <button
              onClick={() => setGarmentSource("custom")}
              className={cn(
                "py-2 font-mono text-[10px] uppercase tracking-wider text-center transition",
                garmentSource === "custom"
                  ? "bg-foreground text-background font-bold"
                  : "bg-surface text-foreground/70 hover:text-foreground",
              )}
            >
              UPLOAD CLOTHING
            </button>
          </div>

          {/* SOURCE 1: CATALOG COLLECTION */}
          {garmentSource === "catalog" ? (
            <div className="mt-6 text-left">
              <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/60 text-left mb-2">
                SELECT CLOTHING ITEM
              </p>
              <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-2 text-left">
                {products.slice(0, 16).map((p) => (
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
                      selected?.id === p.id
                        ? "border-foreground ring-2 ring-foreground"
                        : "border-foreground/25 hover:border-foreground",
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
                    <p className="font-serif text-sm font-semibold text-foreground text-left">
                      {selected.name}
                    </p>
                    <p className="font-mono text-[10px] uppercase text-foreground/50 text-left">
                      {selected.brand} · {formatINR(selected.price)} ·{" "}
                      <span className="font-bold text-foreground">
                        {selected.kind.toUpperCase()}
                      </span>
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
          ) : (
            /* SOURCE 2: CUSTOM GARMENT UPLOAD */
            <div className="mt-6 text-left space-y-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/60 text-left mb-2">
                  GARMENT CATEGORY (FASHN VTON)
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {FASHN_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCustomCategory(c.id)}
                      className={cn(
                        "border px-2 py-2 font-mono text-[10px] uppercase tracking-wider text-center transition",
                        customCategory === c.id
                          ? "border-foreground bg-foreground text-background font-bold"
                          : "border-foreground/20 hover:border-foreground text-foreground",
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-dashed border-foreground/30 p-4 text-center">
                {customGarment ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customGarment}
                      alt="Uploaded custom garment"
                      className="mx-auto h-24 object-contain"
                    />
                    <p className="font-mono text-[10px] text-foreground/60 truncate">
                      {customGarmentName || "Custom clothing plate"}
                    </p>
                    <button
                      onClick={() => customGarmentInputRef.current?.click()}
                      className="font-mono text-[10px] uppercase text-foreground underline"
                    >
                      Change Cloth Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-serif text-xs italic text-foreground/70">
                      Upload any shirt, dress, jacket or pants photo
                    </p>
                    <button
                      onClick={() => customGarmentInputRef.current?.click()}
                      className="border border-foreground bg-foreground/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition"
                    >
                      SELECT GARMENT IMAGE
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

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
                      ? "border-foreground bg-foreground text-background font-bold"
                      : "border-foreground/20 hover:border-foreground text-foreground",
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generation Trigger */}
          <button
            onClick={generate}
            disabled={
              status === "loading" ||
              !photo ||
              (garmentSource === "catalog" ? !selected : !customGarment)
            }
            className="mt-6 flex w-full items-center justify-between border border-foreground bg-foreground px-4 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition hover:opacity-90 disabled:opacity-40 text-left"
          >
            <span>
              {status === "loading"
                ? "RUNNING FASHN DIFFUSION…"
                : "CHANGE CLOTHES IN 3D (FASHN VTON)"}
            </span>
            <IconImage type="arrow" size={14} className="border-none invert dark:invert-0" />
          </button>

          {status === "done" && result && (
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
              POWERED BY FASHN VTON 1.5 · MASKLESS PIXEL SPACE SYNTHESIS · ZERO STORAGE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

