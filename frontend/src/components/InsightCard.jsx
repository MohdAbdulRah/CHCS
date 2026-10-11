export default function InsightCard({ data }) {
    if (!data) return null;

    const { insight, trend, percentile_95, annual_stats, city_name, start_year, end_year } = data;

    const direction = trend?.direction || "no trend";
    const significant = trend?.significant;
    const badgeClass = direction === "increasing" ? "up" : direction === "decreasing" ? "down" : "neutral";
    const badgeIcon = direction === "increasing" ? "📈" : direction === "decreasing" ? "📉" : "➡️";

    const totalEvents = annual_stats?.reduce((s, y) => s + y.count, 0) || 0;
    const maxFreqYear = annual_stats?.reduce((best, y) => y.count > (best?.count || 0) ? y : best, null);

    return (
        <div className="insight-card">
            <div className="insight-icon">🌡️</div>
            <div className="insight-text" style={{ flex: 1 }}>
                <h3>Key Insight — {city_name}</h3>
                <p style={{ marginBottom: "12px" }}>{insight}</p>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    <span className={`trend-badge ${badgeClass}`}>
                        {badgeIcon} {direction}
                        {significant && <span style={{ marginLeft: "4px", opacity: 0.7 }}>★ p&lt;0.05</span>}
                    </span>

                    <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                        95th percentile threshold: <strong style={{ color: "var(--color-primary)" }}>{percentile_95}°C</strong>
                    </span>

                    {maxFreqYear && (
                        <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                            Peak year: <strong style={{ color: "var(--color-accent)" }}>{maxFreqYear.year}</strong> ({maxFreqYear.count} events)
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
