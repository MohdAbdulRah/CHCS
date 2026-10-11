import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function MapSelector({ lat, lon, onLocationSelect }) {
    const position = lat && lon ? [lat, lon] : [20, 78];

    return (
        <div>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                Click anywhere on the map to select coordinates
            </p>
            <div className="map-container">
                <MapContainer
                    center={position}
                    zoom={lat ? 6 : 3}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={true}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution="© CartoDB"
                    />
                    <ClickHandler onLocationSelect={onLocationSelect} />
                    {lat && lon && <Marker position={[lat, lon]} />}
                </MapContainer>
            </div>
        </div>
    );
}
