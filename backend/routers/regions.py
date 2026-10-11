from fastapi import APIRouter

router = APIRouter()

PRESET_REGIONS = [
    {"name": "New Delhi", "lat": 28.6139, "lon": 77.2090, "country": "India"},
    {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777, "country": "India"},
    {"name": "Chennai", "lat": 13.0827, "lon": 80.2707, "country": "India"},
    {"name": "Kolkata", "lat": 22.5726, "lon": 88.3639, "country": "India"},
    {"name": "Bengaluru", "lat": 12.9716, "lon": 77.5946, "country": "India"},
    {"name": "Hyderabad", "lat": 17.3850, "lon": 78.4867, "country": "India"},
    {"name": "Ahmedabad", "lat": 23.0225, "lon": 72.5714, "country": "India"},
    {"name": "Jaipur", "lat": 26.9124, "lon": 75.7873, "country": "India"},
    {"name": "Lucknow", "lat": 26.8467, "lon": 80.9462, "country": "India"},
    {"name": "Nagpur", "lat": 21.1458, "lon": 79.0882, "country": "India"},
    {"name": "London", "lat": 51.5074, "lon": -0.1278, "country": "UK"},
    {"name": "Paris", "lat": 48.8566, "lon": 2.3522, "country": "France"},
    {"name": "New York", "lat": 40.7128, "lon": -74.0060, "country": "USA"},
    {"name": "Los Angeles", "lat": 34.0522, "lon": -118.2437, "country": "USA"},
    {"name": "Dubai", "lat": 25.2048, "lon": 55.2708, "country": "UAE"},
    {"name": "Sydney", "lat": -33.8688, "lon": 151.2093, "country": "Australia"},
    {"name": "Tokyo", "lat": 35.6762, "lon": 139.6503, "country": "Japan"},
    {"name": "Beijing", "lat": 39.9042, "lon": 116.4074, "country": "China"},
    {"name": "Cairo", "lat": 30.0444, "lon": 31.2357, "country": "Egypt"},
    {"name": "Nairobi", "lat": -1.2921, "lon": 36.8219, "country": "Kenya"},
]

@router.get("/regions")
def list_regions():
    return {"regions": PRESET_REGIONS}
