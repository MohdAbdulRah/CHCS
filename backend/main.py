import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from routers import regions, analyze as analyze_router

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Climate Hazard Trend Analyzer API",
    description="Analyzes historical weather data to detect and visualize heatwave trends.",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS – allow frontend origins
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(regions.router, prefix="/api", tags=["Regions"])
app.include_router(analyze_router.router, prefix="/api", tags=["Analysis"])


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "climate-hazard-api"}
