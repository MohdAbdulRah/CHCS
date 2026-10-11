import pytest
from starlette.testclient import TestClient
from main import app
from services.db import get_cached, set_cached, make_cache_key

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "climate-hazard-api"}

def test_list_regions():
    response = client.get("/api/regions")
    assert response.status_code == 200
    data = response.json()
    assert "regions" in data
    assert len(data["regions"]) == 20
    assert any(r["name"] == "New Delhi" for r in data["regions"])

def test_validation_end_year_before_start():
    response = client.post("/api/analyze", json={
        "lat": 28.6,
        "lon": 77.2,
        "start_year": 2020,
        "end_year": 1990,
        "city_name": "Test"
    })
    assert response.status_code == 422
    assert "end_year must be greater than start_year" in response.json()["detail"]

def test_validation_year_range_too_large():
    response = client.post("/api/analyze", json={
        "lat": 28.6,
        "lon": 77.2,
        "start_year": 1940,
        "end_year": 2024,
        "city_name": "Test"
    })
    assert response.status_code == 422
    assert "cannot exceed 80 years" in response.json()["detail"]

def test_validation_invalid_coordinates():
    response = client.post("/api/analyze", json={
        "lat": 120.0,  # Invalid latitude (> 90)
        "lon": 77.2,
        "start_year": 1990,
        "end_year": 2020,
        "city_name": "Test"
    })
    assert response.status_code == 422

def test_tinydb_caching_roundtrip():
    key_lat, key_lon = 12.3456, 78.9101
    start_yr, end_yr = 2000, 2010
    sample_data = {
        "dates": ["2000-01-01", "2000-01-02"],
        "tmax": [30.0, 31.0]
    }
    set_cached(key_lat, key_lon, start_yr, end_yr, sample_data)
    retrieved = get_cached(key_lat, key_lon, start_yr, end_yr)
    assert retrieved == sample_data
