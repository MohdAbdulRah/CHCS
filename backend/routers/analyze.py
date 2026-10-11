from fastapi import APIRouter, HTTPException, Request
from models import AnalyzeRequest
from services.weather import fetch_weather
from services.heatwave import detect_heatwaves
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()


@router.post("/analyze")
@limiter.limit("30/minute")
async def analyze(request: Request, body: AnalyzeRequest):
    """
    Main analysis endpoint.
    Fetches historical weather data, detects heatwaves, computes trend statistics,
    and returns JSON summary suitable for frontend charting.
    """
    if body.end_year <= body.start_year:
        raise HTTPException(status_code=422, detail="end_year must be greater than start_year")
    if body.end_year - body.start_year > 80:
        raise HTTPException(status_code=422, detail="Time range cannot exceed 80 years")

    try:
        weather_data = await fetch_weather(
            lat=body.lat,
            lon=body.lon,
            start_year=body.start_year,
            end_year=body.end_year,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch weather data: {str(e)}")

    result = detect_heatwaves(weather_data["dates"], weather_data["tmax"])
    result["city_name"] = body.city_name
    result["lat"] = body.lat
    result["lon"] = body.lon
    result["start_year"] = body.start_year
    result["end_year"] = body.end_year

    return result
