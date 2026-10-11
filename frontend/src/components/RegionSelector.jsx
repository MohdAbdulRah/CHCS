import { useEffect, useState } from "react";
import { getRegions } from "../api/client";

export default function RegionSelector({ lat, lon, cityName, onChange }) {
    const [regions, setRegions] = useState([]);
    const [mode, setMode] = useState("preset"); // 'preset' | 'custom'

    useEffect(() => {
        getRegions().then(setRegions).catch(console.error);
    }, []);

    function handlePreset(e) {
        const val = e.target.value;
        if (!val) return;
        const region = regions.find((r) => r.name === val);
        if (region) {
            onChange({ lat: region.lat, lon: region.lon, cityName: region.name });
        }
    }

    return (
        <div className="card">
            <div className="card-title"><span className="icon">📍</span> Region Selection</div>

            <div className="field-group" style={{ marginBottom: "14px" }}>
                <label>Mode</label>
                <div style={{ display: "flex", gap: "8px" }}>
                    {["preset", "custom"].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            style={{
                                flex: 1,
                                padding: "8px",
                                border: `1px solid ${mode === m ? "var(--color-primary)" : "var(--color-border)"}`,
                                borderRadius: "var(--radius-sm)",
                                background: mode === m ? "var(--color-primary-glow)" : "var(--color-surface)",
                                color: mode === m ? "var(--color-primary)" : "var(--color-text-muted)",
                                cursor: "pointer",
                                fontSize: "0.82rem",
                                fontWeight: 500,
                                fontFamily: "var(--font-body)",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {m === "preset" ? "🌍 Preset City" : "📐 Custom Lat/Lon"}
                        </button>
                    ))}
                </div>
            </div>

            {mode === "preset" ? (
                <div className="field-group">
                    <label>Select City</label>
                    <select
                        id="city-selector"
                        className="custom-select"
                        value={cityName}
                        onChange={handlePreset}
                    >
                        <option value="">-- Choose a city --</option>
                        {Object.entries(
                            regions.reduce((acc, r) => {
                                acc[r.country] = acc[r.country] || [];
                                acc[r.country].push(r);
                                return acc;
                            }, {})
                        ).map(([country, cities]) => (
                            <optgroup key={country} label={country}>
                                {cities.map((c) => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
            ) : (
                <>
                    <div className="field-group" style={{ marginBottom: "12px" }}>
                        <label>Location Name</label>
                        <input
                            id="city-name-input"
                            className="custom-input"
                            placeholder="e.g. My Custom Region"
                            value={cityName}
                            onChange={(e) => onChange({ lat, lon, cityName: e.target.value })}
                        />
                    </div>
                    <div className="lat-lon-row">
                        <div className="field-group">
                            <label>Latitude (−90 to 90)</label>
                            <input
                                id="lat-input"
                                className="custom-input"
                                type="number"
                                step="0.0001"
                                min="-90"
                                max="90"
                                placeholder="28.6139"
                                value={lat ?? ""}
                                onChange={(e) => onChange({ lat: parseFloat(e.target.value), lon, cityName })}
                            />
                        </div>
                        <div className="field-group">
                            <label>Longitude (−180 to 180)</label>
                            <input
                                id="lon-input"
                                className="custom-input"
                                type="number"
                                step="0.0001"
                                min="-180"
                                max="180"
                                placeholder="77.2090"
                                value={lon ?? ""}
                                onChange={(e) => onChange({ lat, lon: parseFloat(e.target.value), cityName })}
                            />
                        </div>
                    </div>
                </>
            )}

            {lat && lon && (
                <div style={{ marginTop: "12px", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                    📌 Selected: {lat?.toFixed(4)}°N, {lon?.toFixed(4)}°E
                </div>
            )}
        </div>
    );
}
