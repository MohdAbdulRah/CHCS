import { useState, lazy, Suspense } from "react";
import RegionSelector from "../components/RegionSelector";
import TimeRangePicker from "../components/TimeRangePicker";
import InsightCard from "../components/InsightCard";
import { FrequencyChart, DurationChart, TrendSummaryChart } from "../components/HazardChart";
import ExportButtons from "../components/ExportButtons";
import { analyzeRegion } from "../api/client";

// Lazy-load Leaflet map to avoid SSR issues
const MapSelector = lazy(() => import("../components/MapSelector"));

export default function Home() {
    const [region, setRegion] = useState({ lat: 28.6139, lon: 77.209, cityName: "New Delhi" });
    const [timeRange, setTimeRange] = useState({ startYear: 1990, endYear: 2020 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [showMap, setShowMap] = useState(false);

    async function handleAnalyze() {
        setError(null);
        setResult(null);
        setLoading(true);
        try {
            const data = await analyzeRegion({
                lat: region.lat,
                lon: region.lon,
                start_year: timeRange.startYear,
                end_year: timeRange.endYear,
                city_name: region.cityName || "Custom Location",
            });
            setResult(data);
        } catch (err) {
            setError(err?.response?.data?.detail || err.message || "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const totalEvents = result?.annual_stats?.reduce((s, y) => s + y.count, 0) || 0;
    const avgPerYear = result?.annual_stats?.length
        ? (totalEvents / result.annual_stats.length).toFixed(1)
        : "—";
    const maxDuration = result?.events?.length
        ? Math.max(...result.events.map((e) => e.duration))
        : "—";
    const peakYear = result?.annual_stats?.reduce((best, y) => y.count > (best?.count || 0) ? y : best, null);

    return (
        <div>
            {/* Header */}
            <header className="app-header">
                <div className="container header-inner">
                    <div className="header-logo">🌡️</div>
                    <div>
                        <div className="header-title">Climate Hazard Trend Analyzer</div>
                    </div>
                    <div className="header-subtitle hidden-mobile">Powered by Open-Meteo &amp; Mann-Kendall</div>
                </div>
            </header>

            {/* Hero */}
            <section className="hero">
                <div className="container">
                    <h1>Analyze Climate Hazard Trends</h1>
                    <p>Detect historical heatwave patterns, measure intensity trends, and surface evidence-based insights for any region worldwide.</p>
                </div>
            </section>

            {/* Controls */}
            <section className="section">
                <div className="container">
                    <div className="controls-grid">
                        <RegionSelector
                            lat={region.lat}
                            lon={region.lon}
                            cityName={region.cityName}
                            onChange={(r) => setRegion(r)}
                        />
                        <TimeRangePicker
                            startYear={timeRange.startYear}
                            endYear={timeRange.endYear}
                            onChange={(t) => setTimeRange(t)}
                        />
                    </div>

                    {/* Map Toggle */}
                    <div className="card section" style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showMap ? "16px" : 0 }}>
                            <div className="card-title" style={{ marginBottom: 0 }}>
                                <span className="icon">🗺️</span> Interactive Map <span style={{ fontSize: "0.7rem", color: "var(--color-primary)", marginLeft: "6px" }}>BONUS</span>
                            </div>
                            <button
                                onClick={() => setShowMap(!showMap)}
                                style={{
                                    padding: "5px 14px",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: "20px",
                                    background: showMap ? "var(--color-primary-glow)" : "transparent",
                                    color: showMap ? "var(--color-primary)" : "var(--color-text-muted)",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    fontFamily: "var(--font-body)",
                                }}
                            >
                                {showMap ? "Hide Map" : "Show Map"}
                            </button>
                        </div>
                        {showMap && (
                            <Suspense fallback={<div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>Loading map…</div>}>
                                <MapSelector
                                    lat={region.lat}
                                    lon={region.lon}
                                    onLocationSelect={(lat, lon) =>
                                        setRegion({ lat: parseFloat(lat.toFixed(4)), lon: parseFloat(lon.toFixed(4)), cityName: region.cityName || "Custom Location" })
                                    }
                                />
                            </Suspense>
                        )}
                    </div>

                    {/* Hazard Badge */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            background: "rgba(255,140,50,0.12)",
                            border: "1px solid rgba(255,140,50,0.3)",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            fontSize: "0.85rem", fontWeight: 600, color: "var(--color-primary)"
                        }}>
                            🔥 Hazard Type: <strong>Heatwave</strong>
                            <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", fontWeight: 400 }}>
                                (3+ consecutive days above 95th percentile — fixed per spec)
                            </span>
                        </div>
                    </div>

                    {/* Analyze Button */}
                    <button
                        id="analyze-btn"
                        className="btn-analyze"
                        onClick={handleAnalyze}
                        disabled={loading || !region.lat || !region.lon}
                    >
                        {loading ? (
                            <><div className="spinner" /> Fetching &amp; Analyzing…</>
                        ) : (
                            <>🔍 Analyze Heatwave Trends</>
                        )}
                    </button>

                    {/* Error */}
                    {error && (
                        <div className="error-banner" style={{ marginTop: "16px" }}>
                            ⚠️ {error}
                        </div>
                    )}
                </div>
            </section>

            {/* Results */}
            {result && (
                <section className="results-section">
                    <div className="container">

                        {/* Insight */}
                        <div className="section">
                            <InsightCard data={result} />
                        </div>

                        {/* Stats */}
                        <div className="section stats-row">
                            <div className="stat-card">
                                <div className="stat-value">{totalEvents}</div>
                                <div className="stat-label">Total Events</div>
                                <div className="stat-sub">{timeRange.startYear}–{timeRange.endYear}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{avgPerYear}</div>
                                <div className="stat-label">Avg / Year</div>
                                <div className="stat-sub">Events per year</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{maxDuration}</div>
                                <div className="stat-label">Longest Event</div>
                                <div className="stat-sub">Days</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{peakYear?.year || "—"}</div>
                                <div className="stat-label">Peak Year</div>
                                <div className="stat-sub">{peakYear?.count || 0} events</div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="charts-grid section">
                            <FrequencyChart annualStats={result.annual_stats} trend={result.trend} />
                            <DurationChart annualStats={result.annual_stats} />
                            <TrendSummaryChart annualStats={result.annual_stats} trend={result.trend} />
                        </div>

                        {/* Export */}
                        <div className="card section">
                            <div className="card-title">
                                <span className="icon">⬇️</span> Export Data
                                <span style={{ fontSize: "0.7rem", color: "var(--color-primary)", marginLeft: "6px" }}>BONUS</span>
                            </div>
                            <ExportButtons data={result} disabled={!result} />
                        </div>

                        {/* Trend Details */}
                        <div className="card">
                            <div className="card-title"><span className="icon">📐</span> Statistical Analysis</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                                {[
                                    { label: "95th Percentile Threshold", value: `${result.percentile_95}°C` },
                                    { label: "Trend Direction", value: result.trend.direction },
                                    { label: "Regression Slope", value: `${result.trend.slope > 0 ? "+" : ""}${result.trend.slope.toFixed(4)} events/yr` },
                                    { label: "Mann-Kendall τ (tau)", value: result.trend.mk_tau },
                                    { label: "Mann-Kendall p-value", value: result.trend.mk_p },
                                    { label: "Statistical Significance", value: result.trend.significant ? "✅ Yes (p < 0.05)" : "❌ Not significant" },
                                ].map(({ label, value }) => (
                                    <div key={label} style={{ padding: "12px 0", borderBottom: "1px solid var(--color-border)" }}>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>{label}</div>
                                        <div style={{ fontWeight: 600, color: "var(--color-text)" }}>{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </section>
            )}

            {/* Empty State */}
            {!result && !loading && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-text-muted)" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🌤️</div>
                    <p>Select a region and time range, then click <strong>Analyze</strong> to see heatwave trends.</p>
                </div>
            )}
        </div>
    );
}
