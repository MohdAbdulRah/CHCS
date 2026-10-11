import pytest
import numpy as np
from services.heatwave import detect_heatwaves, _pairs, _compute_trend, _build_insight

def test_pairs_drops_nulls():
    dates = ["2000-01-01", "2000-01-02", "2000-01-03"]
    tmax = [25.0, None, 30.5]
    clean_d, clean_t = _pairs(dates, tmax)
    assert clean_d == ["2000-01-01", "2000-01-03"]
    assert clean_t == [25.0, 30.5]

def test_empty_input():
    res = detect_heatwaves([], [])
    assert res["percentile_95"] == 0.0
    assert len(res["events"]) == 0
    assert len(res["annual_stats"]) == 0
    assert "No temperature data available" in res["insight"]

def test_heatwave_detection_threshold_and_consecutive_days():
    """
    Construct a synthetic 200-day series where:
    - 194 days are around 20C
    - Days 30-31 (2 days) are 45C (hot, but < 3 consecutive days -> NOT an event)
    - Days 60-63 (4 days) are 45C (hot, >= 3 consecutive days -> IS an event)
    Total hot days = 6 / 200 = 3% of data, placing them above the 95th percentile.
    """
    dates = [f"2000-01-{i+1:03d}" for i in range(200)]
    tmax = [20.0] * 200
    # 2 consecutive hot days:
    tmax[30] = 45.0
    tmax[31] = 45.0
    # 4 consecutive hot days:
    tmax[60] = 45.0
    tmax[61] = 45.0
    tmax[62] = 45.0
    tmax[63] = 45.0

    res = detect_heatwaves(dates, tmax)
    assert res["percentile_95"] < 45.0
    # Only the 4-day run qualifies as a heatwave (>= 3 consecutive days)
    assert len(res["events"]) == 1
    ev = res["events"][0]
    assert ev["duration"] == 4
    assert ev["start"] == dates[60]
    assert ev["end"] == dates[63]
    assert ev["max_temp"] == 45.0

def test_trend_computation_increasing():
    stats = [
        {"year": 1990 + i, "count": 1 + i * 2, "mean_duration": 4.0, "total_days": (1 + i * 2) * 4}
        for i in range(20)
    ]
    trend = _compute_trend(stats)
    assert trend["slope"] > 0
    assert trend["direction"] == "increasing"
    assert trend["significant"] is True
    assert trend["mk_p"] < 0.05
    assert len(trend["rolling_avg"]) == 20

def test_insight_generation():
    stats = [
        {"year": 1990, "count": 2, "mean_duration": 3.0, "total_days": 6},
        {"year": 1991, "count": 2, "mean_duration": 3.0, "total_days": 6},
        {"year": 2019, "count": 6, "mean_duration": 5.0, "total_days": 30},
        {"year": 2020, "count": 6, "mean_duration": 5.0, "total_days": 30},
    ]
    trend = {
        "slope": 0.15,
        "mk_tau": 0.8,
        "mk_p": 0.01,
        "significant": True,
        "direction": "increasing",
    }
    insight = _build_insight(stats, trend)
    assert "Heatwaves have increased" in insight
    assert "statistically significant" in insight
