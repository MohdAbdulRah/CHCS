import numpy as np
from typing import List, Optional, Dict, Any
import pymannkendall as mk

def _pairs(dates: List[str], tmax: List[Optional[float]]):
    """Return (dates, tmax) with None/null values dropped."""
    clean_dates, clean_tmax = [], []
    for d, t in zip(dates, tmax):
        if t is not None:
            clean_dates.append(d)
            clean_tmax.append(float(t))
    return clean_dates, clean_tmax


def detect_heatwaves(dates: List[str], tmax: List[Optional[float]]) -> Dict[str, Any]:
    """
    Detect heatwave events using the 95th-percentile, 3+-consecutive-days rule.

    Returns:
        {
          "percentile_95": float,
          "events": [{"start": str, "end": str, "duration": int, "max_temp": float, "avg_temp": float}, ...],
          "annual_stats": [{"year": int, "count": int, "mean_duration": float, "total_days": int}, ...],
          "trend": {"slope": float, "mk_tau": float, "mk_p": float, "significant": bool, "direction": str},
          "insight": str
        }
    """
    clean_dates, clean_tmax = _pairs(dates, tmax)
    if not clean_tmax:
        return _empty_result()

    arr_tmax = np.array(clean_tmax, dtype=float)
    p95 = float(np.percentile(arr_tmax, 95))

    # Mark hot days
    hot = arr_tmax > p95

    # Find runs of 3+ consecutive hot days
    events = []
    i = 0
    n = len(hot)
    while i < n:
        if hot[i]:
            j = i
            while j < n and hot[j]:
                j += 1
            run_len = j - i
            if run_len >= 3:
                event_temps = arr_tmax[i:j]
                events.append({
                    "start": clean_dates[i],
                    "end": clean_dates[j - 1],
                    "duration": run_len,
                    "max_temp": round(float(np.max(event_temps)), 2),
                    "avg_temp": round(float(np.mean(event_temps)), 2),
                })
            i = j
        else:
            i += 1

    # Build annual stats
    year_map: Dict[int, List] = {}
    for ev in events:
        yr = int(ev["start"][:4])
        year_map.setdefault(yr, []).append(ev)

    all_years = sorted({int(d[:4]) for d in clean_dates})
    annual_stats = []
    for yr in all_years:
        evs = year_map.get(yr, [])
        count = len(evs)
        mean_dur = round(float(np.mean([e["duration"] for e in evs])), 2) if evs else 0.0
        total_d = sum(e["duration"] for e in evs)
        annual_stats.append({
            "year": yr,
            "count": count,
            "mean_duration": mean_dur,
            "total_days": total_d,
        })

    # Trend analysis
    trend = _compute_trend(annual_stats)

    # Insight
    insight = _build_insight(annual_stats, trend)

    return {
        "percentile_95": round(p95, 2),
        "events": events,
        "annual_stats": annual_stats,
        "trend": trend,
        "insight": insight,
    }


def _compute_trend(annual_stats: List[Dict]) -> Dict:
    if len(annual_stats) < 3:
        return {"slope": 0.0, "mk_tau": 0.0, "mk_p": 1.0, "significant": False, "direction": "no trend"}

    counts = [s["count"] for s in annual_stats]

    # Mann-Kendall test
    try:
        result = mk.original_test(counts)
        tau = round(float(result.Tau), 4)
        p_val = round(float(result.p), 4)
        significant = p_val < 0.05
        direction = result.trend  # 'increasing', 'decreasing', 'no trend'
    except Exception:
        tau, p_val, significant, direction = 0.0, 1.0, False, "no trend"

    # Linear regression slope
    years = np.array([s["year"] for s in annual_stats], dtype=float)
    y = np.array(counts, dtype=float)
    if len(years) > 1 and np.std(y) > 0:
        slope = float(np.polyfit(years - years[0], y, 1)[0])
    else:
        slope = 0.0

    # 10-year rolling average windows
    rolling = []
    for i in range(len(annual_stats)):
        window = counts[max(0, i - 4): i + 5]
        rolling.append(round(float(np.mean(window)), 2))

    return {
        "slope": round(slope, 4),
        "mk_tau": tau,
        "mk_p": p_val,
        "significant": significant,
        "direction": direction,
        "rolling_avg": rolling,
    }


def _build_insight(annual_stats: List[Dict], trend: Dict) -> str:
    if not annual_stats:
        return "No data available for the selected region and time range."

    counts = [s["count"] for s in annual_stats]
    if not any(counts):
        return "No heatwave events detected in this region for the selected period."

    first_decade = [s["count"] for s in annual_stats if s["year"] < annual_stats[0]["year"] + 10]
    last_decade = [s["count"] for s in annual_stats if s["year"] >= annual_stats[-1]["year"] - 9]

    avg_first = np.mean(first_decade) if first_decade else 0
    avg_last = np.mean(last_decade) if last_decade else 0

    direction = trend.get("direction", "no trend")
    slope = trend.get("slope", 0)
    sig = trend.get("significant", False)
    start_yr = annual_stats[0]["year"]
    end_yr = annual_stats[-1]["year"]
    total_events = sum(counts)

    if avg_first > 0:
        pct_change = ((avg_last - avg_first) / avg_first) * 100
        pct_str = f"{abs(pct_change):.0f}%"
        change_word = "increased" if pct_change > 0 else "decreased"
        sig_str = " (statistically significant)" if sig else ""
        return (
            f"Heatwaves have {change_word} by {pct_str} in this region since {start_yr}{sig_str}. "
            f"A total of {total_events} heatwave events were detected between {start_yr}–{end_yr}, "
            f"with an average of {slope:+.2f} events/year trend ({direction})."
        )
    else:
        return (
            f"A total of {total_events} heatwave events were detected between {start_yr}–{end_yr} "
            f"with a {direction} trend ({slope:+.2f} events/year)."
        )


def _empty_result() -> Dict:
    return {
        "percentile_95": 0.0,
        "events": [],
        "annual_stats": [],
        "trend": {"slope": 0.0, "mk_tau": 0.0, "mk_p": 1.0, "significant": False, "direction": "no trend", "rolling_avg": []},
        "insight": "No temperature data available for the selected region and time range.",
    }
