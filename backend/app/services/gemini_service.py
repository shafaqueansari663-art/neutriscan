import json
import re
from io import BytesIO

import google.generativeai as genai
from PIL import Image, UnidentifiedImageError

from app.config import Settings
from app.schemas.nutrition import NutritionScanResult

SYSTEM_INSTRUCTION = """You are an expert nutritionist and food data analyst. Analyze the provided image. First, identify the food item(s) visible. Second, estimate the portion size based on visual context (e.g., standard plate size, standard cup). Third, calculate the estimated total nutritional values for the specific portion shown in the image.

You MUST return the result strictly as a valid JSON object. Do not include any markdown formatting, explanations, or conversational text. Use exactly these keys: "food_name" (string), "portion_estimation" (string), "calories" (number), "protein_g" (number), "carbs_g" (number), "fats_g" (number)."""


def _extract_json_object(text: str) -> dict:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if fence:
        text = fence.group(1).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in model response")
    return json.loads(text[start : end + 1])


def _response_feedback(response) -> str | None:
    if getattr(response, "candidates", None):
        return None
    pf = getattr(response, "prompt_feedback", None)
    if pf is not None:
        br = getattr(pf, "block_reason", None)
        if br is not None:
            return f"Prompt blocked: {br}"
    return "Model returned no candidates (often safety or policy)."


def _response_text_safe(response) -> tuple[str | None, str | None]:
    """Returns (text, error)."""
    err = _response_feedback(response)
    if err:
        return None, err
    try:
        t = response.text
    except ValueError as e:
        return None, str(e) or "Could not read response text (blocked or empty parts)."
    if not t or not str(t).strip():
        return None, "Empty response text from model."
    return str(t).strip(), None


def _parse_json_payload(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return _extract_json_object(text)


def _is_quota_error(exc: BaseException) -> bool:
    msg = str(exc).lower()
    if "429" in str(exc) or "resource exhausted" in msg:
        return True
    if "quota" in msg and ("exceed" in msg or "limit" in msg):
        return True
    t = type(exc).__name__
    return "ResourceExhausted" in t or "TooManyRequests" in t


def _quota_user_message(model: str) -> str:
    return (
        "Gemini API rate limit or quota exceeded (HTTP 429). "
        f"Your project may have no free quota left for `{model}`. "
        "Try: wait a few minutes; set GEMINI_MODEL=gemini-2.5-flash-lite in backend/.env; "
        "or enable billing / check usage at https://ai.google.dev/gemini-api/docs/rate-limits"
    )


def _is_model_not_found(exc: BaseException) -> bool:
    msg = str(exc).lower()
    return "404" in str(exc) or "not found" in msg or "is not found for api version" in msg


def analyze_food_image(image_bytes: bytes, settings: Settings) -> NutritionScanResult:
    try:
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError as e:
        raise ValueError(
            "Unsupported or corrupt image. Try JPEG or PNG. (HEIC may need conversion.)"
        ) from e
    except Exception as e:
        raise ValueError(f"Could not open image: {e}") from e

    genai.configure(api_key=settings.gemini_api_key)
    contents = [
        "Analyze the attached food image and output only the JSON object specified in your instructions.",
        img,
    ]

    attempts: list[str] = []

    # Text-style response first: one successful vision call (saves quota vs JSON+text retries).
    # JSON MIME second only if parse/schema fails on the first response.
    for use_json_mime in (False, True):
        model_kwargs: dict = {
            "model_name": settings.gemini_model,
            "system_instruction": SYSTEM_INSTRUCTION,
        }
        if use_json_mime:
            model_kwargs["generation_config"] = {"response_mime_type": "application/json"}

        model = genai.GenerativeModel(**model_kwargs)
        try:
            response = model.generate_content(contents)
        except Exception as e:
            label = "JSON mode" if use_json_mime else "Text mode"
            attempts.append(f"{label} API call: {e}")
            if _is_quota_error(e):
                raise ValueError(_quota_user_message(settings.gemini_model)) from e
            if _is_model_not_found(e):
                raise ValueError(
                    f"Gemini model `{settings.gemini_model}` is not available (404). "
                    "Set GEMINI_MODEL in backend/.env to a current id, e.g. gemini-2.5-flash or "
                    "gemini-2.5-flash-lite. See https://ai.google.dev/gemini-api/docs/models"
                ) from e
            continue

        text, terr = _response_text_safe(response)
        if terr:
            attempts.append(f"{'JSON mode' if use_json_mime else 'Text mode'}: {terr}")
            continue
        assert text is not None

        try:
            raw = _parse_json_payload(text)
        except (json.JSONDecodeError, ValueError) as e:
            attempts.append(f"{'JSON mode' if use_json_mime else 'Text mode'} parse: {e}")
            continue

        try:
            return NutritionScanResult.model_validate(raw)
        except Exception as e:
            attempts.append(f"{'JSON mode' if use_json_mime else 'Text mode'} schema: {e}")
            continue

    raise ValueError("Gemini analysis failed. " + " | ".join(attempts))
