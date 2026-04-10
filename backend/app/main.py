from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_auth import router as auth_router
from app.api.routes_logs import router as logs_router
from app.api.routes_scan import router as scan_router

app = FastAPI(title="Nutri Scan API")

app.add_middleware(
    CORSMiddleware,
    # Open CORS for local dev; fetch() does not send cookies by default.
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(logs_router)
app.include_router(scan_router)


@app.get("/health")
def health():
    return {"status": "ok"}
