import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
});

export async function getRegions() {
    const res = await api.get("/api/regions");
    return res.data.regions;
}

export async function analyzeRegion({ lat, lon, start_year, end_year, city_name }) {
    const res = await api.post("/api/analyze", { lat, lon, start_year, end_year, city_name });
    return res.data;
}
