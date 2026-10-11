from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="Latitude of the region center")
    lon: float = Field(..., ge=-180, le=180, description="Longitude of the region center")
    start_year: int = Field(..., ge=1940, le=2023)
    end_year: int = Field(..., ge=1941, le=2024)
    city_name: str = Field(default="Custom Location", max_length=100)

    model_config = {"json_schema_extra": {"example": {
        "lat": 28.6, "lon": 77.2,
        "start_year": 1990, "end_year": 2020,
        "city_name": "New Delhi"
    }}}
