import httpx
from services.db import get_cached, set_cached

OPEN_METEO_URL = "https://archive-api.open-meteo.com/v1/archive"

async def fetch_weather(lat: float, lon: float, start_year: int, end_year: int) -> dict:
    """
    Fetch daily maximum temperature data from Open-Meteo historical archive.
    Returns a dict with 'dates' (list of str) and 'tmax' (list of float|None).
    Uses TinyDB cache to avoid redundant API calls.
    """
    cached = get_cached(lat, lon, start_year, end_year)
    if cached:
        return cached

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": f"{start_year}-01-01",
        "end_date": f"{end_year}-12-31",
        "daily": "temperature_2m_max",
        "timezone": "auto",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.get(OPEN_METEO_URL, params=params)
        response.raise_for_status()

    payload = response.json()
    daily = payload.get("daily", {})
    dates = daily.get("time", [])
    tmax = daily.get("temperature_2m_max", [])

    # Replace None with NaN-equivalent (keep as None, handle in analysis)
    data = {"dates": dates, "tmax": tmax}
    set_cached(lat, lon, start_year, end_year, data)
    return data
