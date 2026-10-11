export default function TimeRangePicker({ startYear, endYear, onChange }) {
    const MIN_YEAR = 1950;
    const MAX_YEAR = 2023;

    function handleStart(e) {
        const val = parseInt(e.target.value);
        onChange({ startYear: val, endYear: Math.max(val + 1, endYear) });
    }

    function handleEnd(e) {
        const val = parseInt(e.target.value);
        onChange({ startYear: Math.min(startYear, val - 1), endYear: val });
    }

    const startPct = ((startYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
    const endPct = ((endYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

    return (
        <div className="card">
            <div className="card-title"><span className="icon">📅</span> Time Range</div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>Start Year</span>
                <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}>End Year</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span className="range-val">{startYear}</span>
                <span style={{ fontSize: "0.78rem", color: "var(--color-text-faint)", alignSelf: "center" }}>
                    {endYear - startYear} years
                </span>
                <span className="range-val">{endYear}</span>
            </div>

            <div className="field-group" style={{ marginBottom: "14px" }}>
                <label>Start Year</label>
                <input
                    id="start-year-slider"
                    className="custom-range"
                    type="range"
                    min={MIN_YEAR}
                    max={MAX_YEAR - 1}
                    value={startYear}
                    onChange={handleStart}
                    style={{ "--pct": `${startPct}%` }}
                />
            </div>

            <div className="field-group">
                <label>End Year</label>
                <input
                    id="end-year-slider"
                    className="custom-range"
                    type="range"
                    min={MIN_YEAR + 1}
                    max={MAX_YEAR}
                    value={endYear}
                    onChange={handleEnd}
                    style={{ "--pct": `${endPct}%` }}
                />
            </div>

            <div style={{
                marginTop: "14px",
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
            }}>
                {[[1950, 1980], [1980, 2000], [1990, 2020], [2000, 2023]].map(([s, e]) => (
                    <button
                        key={`${s}-${e}`}
                        onClick={() => onChange({ startYear: s, endYear: e })}
                        style={{
                            padding: "4px 10px",
                            border: `1px solid ${startYear === s && endYear === e ? "var(--color-primary)" : "var(--color-border)"}`,
                            borderRadius: "20px",
                            background: startYear === s && endYear === e ? "var(--color-primary-glow)" : "transparent",
                            color: startYear === s && endYear === e ? "var(--color-primary)" : "var(--color-text-muted)",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontFamily: "var(--font-body)",
                        }}
                    >
                        {s}–{e}
                    </button>
                ))}
            </div>
        </div>
    );
}
