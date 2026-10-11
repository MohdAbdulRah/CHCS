# Climate Hazard Trend Analyzer

A full-stack web application that analyzes historical weather data and visualizes trends in heatwave events for any selected region worldwide.

## 🚀 Live Demo

- **Frontend**: (deploy to Vercel after pushing to GitHub)
- **Backend API**: (deploy to Render after pushing to GitHub)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         React + Vite Frontend        │
│  (RegionSelector, Recharts, Leaflet) │
└───────────────┬─────────────────────┘
                │ POST /api/analyze
                ▼
┌─────────────────────────────────────┐
│         FastAPI Backend              │
│  - Open-Meteo API (historical tmax) │
│  - TinyDB (NoSQL cache, 7-day TTL)  │
│  - Heatwave detection (95th pctile) │
│  - Mann-Kendall + Linear Regression │
│  - slowapi rate limiting (30/min)   │
└─────────────────────────────────────┘
```

**Stack:**
| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite 5 |
| Charting | Recharts |
| Map | Leaflet + react-leaflet |
| Export | jsPDF + PapaParse |
| Backend | Python 3.11 + FastAPI |
| NoSQL DB | TinyDB (file-based JSON store) |
| Data Source | Open-Meteo Historical Archive API |
| Trend Analysis | pymannkendall + numpy linear regression |
| Rate Limiting | slowapi |
| Input Validation | Pydantic v2 |

---

## ⚙️ Setup & Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 📡 Data Source

**[Open-Meteo Historical Archive API](https://open-meteo.com/en/docs/historical-weather-api)**

- Free, no API key required
- Covers 1940–present
- Provides daily `temperature_2m_max` at any lat/lon worldwide
- Uses ERA5 reanalysis data from ECMWF

**Caching:** Results are stored in `backend/weather_cache.json` (TinyDB) for 7 days before re-fetching.

---

## 🌡️ Heatwave Detection Logic

A **heatwave event** is defined as:

> **3 or more consecutive days** where the daily maximum temperature (`temperature_2m_max`) exceeds the **95th percentile** of all daily maximum temperatures in the selected time period for that region.

**Steps:**
1. Fetch all daily `tmax` values for the region and time range
2. Drop null/missing values
3. Compute `p95 = np.percentile(tmax_array, 95)` over the entire dataset
4. Mark each day as "hot" if `tmax > p95`
5. Identify consecutive runs of hot days ≥ 3 days long
6. Each such run = one heatwave event, with attributes: `start_date`, `end_date`, `duration_days`, `max_temp`, `avg_temp`

**Annual statistics** are aggregated per year: event count, mean duration, total hot days.

---

## 📈 Trend Analysis

Two complementary methods are applied:

### 1. Linear Regression (numpy)
- Fits a least-squares line through annual heatwave counts
- `slope` = change in events per year
- Plotted as the green regression line in charts

### 2. Mann-Kendall Test (pymannkendall)
- Non-parametric test for monotonic trends in time series
- Outputs: `tau` (correlation coefficient), `p-value`, `trend direction`
- `significant = True` when `p < 0.05`
- More robust than linear regression for noisy climate data

### 3. 10-Year Rolling Average
- Smoothed via centered window (window size 9)
- Plotted as the dashed blue line in the frequency chart

---

## 🔒 Security & Performance

| Feature | Implementation |
|---------|---------------|
| Rate limiting | `slowapi`: 30 requests/minute per IP |
| Input validation | Pydantic v2 bounds: lat ∈ [−90,90], lon ∈ [−180,180], years ∈ [1940,2024] |
| CORS | Configurable via `ALLOWED_ORIGINS` env var |
| Caching | TinyDB: no repeated Open-Meteo calls within 7 days for same region |
| Error handling | 502 for upstream failures, 422 for validation errors |

---

## 🗺️ Key Features

- ✅ 20 preset cities across 10 countries
- ✅ Custom lat/lon input for any global location  
- ✅ Year range slider (1950–2023)
- ✅ Interactive Leaflet map for coordinate selection (click to pin)
- ✅ Annual frequency bar chart with rolling average
- ✅ Heatwave duration trend area chart
- ✅ Regression line visualization
- ✅ Summary insight card with percentage change
- ✅ Statistical analysis table (Mann-Kendall tau, p-value, slope)
- ✅ Export: Events CSV, Annual Stats CSV, full PDF report

---

## 📁 Project Structure

```
CHCS/
├── backend/
│   ├── main.py              # FastAPI app, middleware
│   ├── models.py            # Pydantic request models
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── routers/
│   │   ├── analyze.py       # POST /api/analyze
│   │   └── regions.py       # GET /api/regions
│   └── services/
│       ├── db.py            # TinyDB cache (7-day TTL)
│       ├── weather.py       # Open-Meteo API client
│       └── heatwave.py      # Detection + trend logic
├── frontend/
│   ├── src/
│   │   ├── api/client.js    # Axios API client
│   │   ├── components/
│   │   │   ├── RegionSelector.jsx
│   │   │   ├── TimeRangePicker.jsx
│   │   │   ├── HazardChart.jsx    # 3 Recharts visualizations
│   │   │   ├── InsightCard.jsx
│   │   │   ├── MapSelector.jsx    # Leaflet interactive map
│   │   │   └── ExportButtons.jsx  # CSV + PDF export
│   │   └── pages/Home.jsx         # Main page layout
│   ├── index.html
│   └── vite.config.js       # Dev proxy to :8000
└── README.md
```

---

## 🧠 Assumptions

1. **Heatwave definition**: The 95th percentile is computed over the entire selected time range (not a fixed baseline period). This is a common approach when baseline data availability varies by region.
2. **Missing data**: Days with `null` temperature values (API gaps) are excluded from percentile calculation and hot-day detection. Events spanning null days are split.
3. **Single hazard type**: Only heatwaves are implemented per the assignment default requirement.
4. **NoSQL choice**: TinyDB is a file-based JSON document store — it satisfies the "NoSQL" requirement, is zero-dependency for deployment, and is ideal for this caching use case. In production, MongoDB Atlas or DynamoDB would be used.
5. **Open-Meteo accuracy**: ERA5 reanalysis data is considered high quality for historical analysis but may differ from point weather station observations by ±1-2°C.

---

## 🔮 What I'd Improve With More Time

1. **Multi-hazard support**: Add drought (SPI index) and heavy rainfall detection
2. **Spatial aggregation**: Average over a bounding box rather than a single point
3. **Real-time updates**: WebSocket streaming for large date ranges
4. **MongoDB Atlas**: Replace TinyDB with cloud-hosted MongoDB for production
5. **User accounts**: Save analysis presets per user
6. **Confidence intervals**: Add bootstrap CI on regression slope
7. **Global climate projections**: Overlay CMIP6 future scenario data

---

## 🤖 AI Tools Used

- **Google Gemini (Antigravity)**: Used to scaffold the full-stack application. Wrote all code files, designed the architecture, synthesized heatwave detection logic, and generated the README. I reviewed all code for correctness, modified the design system, and verified the API contracts.
- **Approach**: AI was used as a pair programmer — it generated initial implementations which I reviewed, debugged if needed, and extended with domain-specific logic.
