from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.config import Settings, get_settings
from app.services.gemini_service import analyze_food_image

router = APIRouter(prefix="/api", tags=["scan"])

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


def _looks_like_image_bytes(data: bytes) -> bool:
    if len(data) < 12:
        return False
    if data[:3] == b"\xff\xd8\xff":
        return True
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return True
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return True
    if data[:4] == b"RIFF" and len(data) >= 12 and data[8:12] == b"WEBP":
        return True
    return False


def _accept_upload(content_type: str | None, data: bytes) -> None:
    ct = (content_type or "").lower().split(";")[0].strip()
    if ct.startswith("image/"):
        return
    if ct in ("", "application/octet-stream", "binary/octet-stream"):
        if _looks_like_image_bytes(data):
            return
    if _looks_like_image_bytes(data):
        return
    raise HTTPException(
        status_code=400,
        detail="File must be an image (e.g. JPEG, PNG, WebP).",
    )


@router.post("/scan")
async def scan_food(
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
):
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Image too large")
    _accept_upload(file.content_type, data)
    try:
        result = analyze_food_image(data, settings)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=str(e)[:800] if str(e) else "Failed to analyze image",
        ) from e
    return result.model_dump(by_alias=False)
