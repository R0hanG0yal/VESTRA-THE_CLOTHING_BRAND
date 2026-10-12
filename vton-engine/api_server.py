"""
FASHN VTON v1.5 API Server
High-Performance Virtual Try-On Microservice for VESTRA
"""

import base64
import io
import os
import sys
import time
import logging
from typing import Optional, Literal
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from PIL import Image

import threading
import torch

# Concurrency lock to prevent multiple simultaneous diffusion passes on GPU
inference_lock = threading.Lock()

# Ensure src is on sys.path
BASE_DIR = Path(__file__).resolve().parent
SRC_DIR = BASE_DIR / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("fashn_api_server")

app = FastAPI(
    title="FASHN VTON v1.5 API",
    description="Photorealistic Maskless Virtual Try-On Service in Pixel Space",
    version="1.5.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WEIGHTS_DIR = os.environ.get("WEIGHTS_DIR", str(BASE_DIR / "weights"))

pipeline_instance = None
is_loading = False

def check_weights_exist() -> bool:
    weights_path = Path(WEIGHTS_DIR)
    model_path = weights_path / "model.safetensors"
    dwpose_yolo = weights_path / "dwpose" / "yolox_l.onnx"
    dwpose_dw = weights_path / "dwpose" / "dw-ll_ucoco_384.onnx"
    return model_path.exists() and dwpose_yolo.exists() and dwpose_dw.exists()

def get_pipeline():
    global pipeline_instance, is_loading
    if pipeline_instance is not None:
        return pipeline_instance

    if not check_weights_exist():
        logger.warning("FASHN VTON weights not found at %s", WEIGHTS_DIR)
        return None

    try:
        is_loading = True
        logger.info("Initializing FASHN VTON TryOnPipeline from %s...", WEIGHTS_DIR)
        from fashn_vton import TryOnPipeline
        pipeline_instance = TryOnPipeline(weights_dir=WEIGHTS_DIR)
        logger.info("FASHN VTON TryOnPipeline initialized successfully!")
        return pipeline_instance
    except Exception as e:
        logger.error("Failed to initialize TryOnPipeline: %s", e, exc_info=True)
        return None
    finally:
        is_loading = False

@app.on_event("startup")
def startup_event():
    """Preload pipeline on server start if weights exist."""
    if check_weights_exist():
        logger.info("Pre-warming FASHN VTON pipeline...")
        get_pipeline()

def decode_image(data_or_path: str) -> Image.Image:
    """Decode base64 data URL, raw base64 string, or read file path."""
    if not data_or_path:
        raise ValueError("Image input is empty")

    if os.path.exists(data_or_path):
        return Image.open(data_or_path).convert("RGB")

    workspace_path = BASE_DIR.parent / data_or_path.lstrip("/\\")
    if workspace_path.exists():
        return Image.open(str(workspace_path)).convert("RGB")

    raw = data_or_path
    if "," in raw:
        raw = raw.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(raw)
        return Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Could not decode image: {e}")

def encode_image(img: Image.Image, format: str = "PNG") -> str:
    """Encode PIL image to base64 data URL."""
    buffer = io.BytesIO()
    img.save(buffer, format=format, quality=95)
    b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    mime = "image/png" if format.upper() == "PNG" else "image/jpeg"
    return f"data:{mime};base64,{b64}"

class TryOnRequest(BaseModel):
    person_image: str = Field(..., description="Base64 data URL or path of user portrait")
    garment_image: str = Field(..., description="Base64 data URL or path of clothing item")
    category: Literal["tops", "bottoms", "one-pieces"] = Field("tops", description="Garment category")
    garment_photo_type: Literal["model", "flat-lay"] = Field("model", description="Photo style (model or flat-lay)")
    num_timesteps: int = Field(15, ge=10, le=50, description="Diffusion steps")
    guidance_scale: float = Field(1.5, ge=1.0, le=5.0, description="Guidance scale")
    seed: Optional[int] = Field(None, description="Random seed")
    segmentation_free: bool = Field(True, description="Segmentation-free maskless inference")

class TryOnResponse(BaseModel):
    status: str
    result_image: str
    category: str
    engine: str
    inference_time_ms: int
    weights_ready: bool
    notes: Optional[list[str]] = None

@app.get("/health")
def health():
    cuda_available = torch.cuda.is_available()
    gpu_name = torch.cuda.get_device_name(0) if cuda_available else None
    weights_ok = check_weights_exist()

    return {
        "status": "healthy",
        "service": "FASHN VTON v1.5 API",
        "version": "1.5.0",
        "weights_dir": WEIGHTS_DIR,
        "weights_exist": weights_ok,
        "pipeline_loaded": pipeline_instance is not None,
        "cuda_available": cuda_available,
        "gpu_name": gpu_name,
        "categories_supported": ["tops", "bottoms", "one-pieces"],
    }

@app.post("/tryon", response_model=TryOnResponse)
def run_tryon(req: TryOnRequest):
    t0 = time.time()
    try:
        person_img = decode_image(req.person_image)
        garment_img = decode_image(req.garment_image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    pipeline = get_pipeline()
    if pipeline is None:
        raise HTTPException(
            status_code=503,
            detail="FASHN VTON pipeline weights are not ready or still initializing."
        )

    try:
        logger.info(
            "Executing FASHN VTON diffusion inference (category=%s, timesteps=%d, photo_type=%s)...",
            req.category,
            req.num_timesteps,
            req.garment_photo_type,
        )
        with inference_lock:
            result = pipeline(
                person_image=person_img,
                garment_image=garment_img,
                category=req.category,
                garment_photo_type=req.garment_photo_type,
                num_samples=1,
                num_timesteps=req.num_timesteps,
                guidance_scale=req.guidance_scale,
                seed=req.seed or 42,
                segmentation_free=req.segmentation_free,
            )
        out_img = result.images[0]
        elapsed_ms = int((time.time() - t0) * 1000)
        logger.info("FASHN VTON inference succeeded in %d ms!", elapsed_ms)

        return TryOnResponse(
            status="completed",
            result_image=encode_image(out_img),
            category=req.category,
            engine="fashn-vton-1.5-local",
            inference_time_ms=elapsed_ms,
            weights_ready=True,
            notes=[
                f"FASHN VTON 1.5 Pixel-Space Diffusion converged in {elapsed_ms}ms",
                f"Category: {req.category.upper()} (Maskless Drape)",
                f"Garment source: {req.garment_photo_type.upper()}",
                f"Resolution: {out_img.width}x{out_img.height}",
            ],
        )
    except Exception as e:
        logger.error("TryOnPipeline failed during inference: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"FASHN VTON diffusion inference failed: {str(e)}"
        )
    finally:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting FASHN VTON v1.5 API Server on http://{host}:{port}")
    uvicorn.run("api_server:app", host=host, port=port, reload=False)
