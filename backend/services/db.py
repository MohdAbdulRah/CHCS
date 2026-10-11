from tinydb import TinyDB, Query
from datetime import datetime, timedelta, timezone
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "weather_cache.json")

_db = None

def get_db() -> TinyDB:
    global _db
    if _db is None:
        _db = TinyDB(DB_PATH)
    return _db

def make_cache_key(lat: float, lon: float, start_year: int, end_year: int) -> str:
    return f"{round(lat,4)}_{round(lon,4)}_{start_year}_{end_year}"

def get_cached(lat: float, lon: float, start_year: int, end_year: int):
    """Return cached weather data if fresh (< 7 days old), else None."""
    db = get_db()
    Record = Query()
    key = make_cache_key(lat, lon, start_year, end_year)
    results = db.search(Record.cache_key == key)
    if not results:
        return None
    record = results[0]
    cached_at = datetime.fromisoformat(record["cached_at"])
    if datetime.now(timezone.utc) - cached_at > timedelta(days=7):
        db.remove(Record.cache_key == key)
        return None
    return record["data"]

def set_cached(lat: float, lon: float, start_year: int, end_year: int, data: dict):
    """Store weather data in TinyDB cache."""
    db = get_db()
    Record = Query()
    key = make_cache_key(lat, lon, start_year, end_year)
    db.remove(Record.cache_key == key)
    db.insert({
        "cache_key": key,
        "cached_at": datetime.now(timezone.utc).isoformat(),
        "data": data
    })
