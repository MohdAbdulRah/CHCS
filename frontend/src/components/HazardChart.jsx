import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
    ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip">
            <div className="label">{label}</div>
            {payload.map((p) => (
                <div key={p.name} className="value" style={{ color: p.color }}>
                    {p.name}: {typeof p.value === "number" ? p.value.toFixed(p.name.includes("Avg") ? 2 : 0) : p.value}
                    {p.name.includes("Days") ? " days" : p.name.includes("°C") ? "°C" : ""}
                </div>
            ))}
        </div>
    );
};

export function FrequencyChart({ annualStats, trend }) {
    if (!annualStats?.length) return null;

    const data = annualStats.map((s, i) => ({
        year: s.year,
        Events: s.count,
        "10yr Avg": trend?.rolling_avg?.[i] ?? null,
    }));

    return (
        <div className="card chart-wrapper">
            <div className="card-title"><span className="icon">📊</span> Annual Heatwave Frequency</div>
            <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="year"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "0.78rem", color: "#94a3b8" }} />
                    <Bar dataKey="Events" fill="#ff8c32" radius={[3, 3, 0, 0]} opacity={0.85} />
                    <Line
                        type="monotone"
                        dataKey="10yr Avg"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="5 3"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

export function DurationChart({ annualStats }) {
    if (!annualStats?.length) return null;

    const data = annualStats
        .filter((s) => s.mean_duration > 0)
        .map((s) => ({
            year: s.year,
            "Avg Duration (Days)": s.mean_duration,
            "Total Days": s.total_days,
        }));

    if (!data.length) return null;

    return (
        <div className="card chart-wrapper">
            <div className="card-title"><span className="icon">⏱️</span> Heatwave Duration Trends</div>
            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                        <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="year"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "0.78rem", color: "#94a3b8" }} />
                    <Area
                        type="monotone"
                        dataKey="Avg Duration (Days)"
                        stroke="#ff4d6d"
                        strokeWidth={2}
                        fill="url(#durationGrad)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function TrendSummaryChart({ annualStats, trend }) {
    if (!annualStats?.length || !trend) return null;

    // Regression line via slope
    const years = annualStats.map((s) => s.year);
    const minYr = years[0];
    const data = annualStats.map((s, i) => ({
        year: s.year,
        Events: s.count,
        "Regression": parseFloat(
            (annualStats[0]?.count + trend.slope * (s.year - minYr)).toFixed(2)
        ),
    }));

    return (
        <div className="card chart-wrapper" style={{ gridColumn: "1 / -1" }}>
            <div className="card-title"><span className="icon">📉</span> Linear Trend — Regression Line</div>
            <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="year"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "0.78rem", color: "#94a3b8" }} />
                    <Bar dataKey="Events" fill="rgba(255,140,50,0.4)" radius={[2, 2, 0, 0]} />
                    <Line
                        type="monotone"
                        dataKey="Regression"
                        stroke="#34d399"
                        strokeWidth={2.5}
                        dot={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
