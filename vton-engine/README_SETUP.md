# FASHN VTON v1.5 Virtual Try-On Integration

This directory hosts the dedicated **FASHN VTON v1.5** inference microservice for the VESTRA clothing web application.

---

## What is FASHN VTON v1.5?
[FASHN VTON v1.5](https://github.com/fashn-AI/fashn-vton-1.5) is an open-source diffusion transformer model that performs photorealistic virtual try-ons directly in pixel space without requiring segmentation masks.

- **Pixel-Space MMDiT Diffusion:** Eliminates VAE texture distortion and produces crisp fabric textures.
- **DWPose Landmark & Pose Detection:** Accurately maps human body joints, posture, and hands.
- **Identity & Feature Preservation:** Preserves tattoos, body proportions, lighting, and hair while realistically draping clothing.
- **Categories Supported:**
  - `tops` (Shirts, T-shirts, Jackets, Hoodies, Knitwear)
  - `bottoms` (Jeans, Trousers, Skirts, Shorts)
  - `one-pieces` (Dresses, Jumpsuits)

---

## Quick Start: Launching the Local Service

### 1. Launch with Batch Script (Windows)
Double-click or run from command prompt:
```bat
run_server.bat
```

Or from PowerShell:
```powershell
.\run_server.ps1
```

The server will automatically start on:
```
http://127.0.0.1:8000
```

---

## Downloading Model Weights (for Full Diffusion Model)
The server works out-of-the-box in preview mode. To enable the full 972M parameter MMDiT diffusion model:

```bash
# Activate virtual environment
.\.venv\Scripts\activate

# Download weights (~2GB) from HuggingFace
python scripts/download_weights.py --weights-dir ./weights
```

This will download:
- `model.safetensors` (TryOnModel weights)
- `dwpose/` (`yolox_l.onnx`, `dw-ll_ucoco_384.onnx`)

---

## Enabling NVIDIA GPU (CUDA) Acceleration
For NVIDIA GPUs (such as RTX 3050, 3060, 4060, etc.):

```bash
.\.venv\Scripts\activate
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
pip install onnxruntime-gpu
```

The server will automatically detect CUDA and switch to GPU inference.

---

## Cloud FASHN AI API (Optional Alternative)
If you prefer running inference in the cloud without local GPU compute:
1. Obtain an API key from [fashn.ai](https://fashn.ai).
2. Add it to `.env.local` in the project root:
   ```env
   FASHN_API_KEY=fa-your-api-key-here
   ```
The Next.js backend will automatically use the cloud API when available.
