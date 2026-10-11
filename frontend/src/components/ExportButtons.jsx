import Papa from "papaparse";
import jsPDF from "jspdf";

export default function ExportButtons({ data, disabled }) {
    function exportCSV() {
        if (!data?.events?.length) return;
        const rows = data.events.map((ev) => ({
            start_date: ev.start,
            end_date: ev.end,
            duration_days: ev.duration,
            max_temp_c: ev.max_temp,
            avg_temp_c: ev.avg_temp,
        }));
        const csv = Papa.unparse(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `heatwaves_${data.city_name}_${data.start_year}-${data.end_year}.csv`;
        link.click();
    }

    function exportAnnualCSV() {
        if (!data?.annual_stats?.length) return;
        const csv = Papa.unparse(data.annual_stats);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `annual_stats_${data.city_name}_${data.start_year}-${data.end_year}.csv`;
        link.click();
    }

    function exportPDF() {
        if (!data) return;
        const doc = new jsPDF();
        const { city_name, start_year, end_year, percentile_95, trend, insight, annual_stats, events } = data;

        // Header
        doc.setFillColor(7, 13, 31);
        doc.rect(0, 0, 210, 297, "F");
        doc.setTextColor(255, 140, 50);
        doc.setFontSize(18);
        doc.text("Climate Hazard Trend Report", 14, 20);

        doc.setTextColor(200, 200, 220);
        doc.setFontSize(11);
        doc.text(`Region: ${city_name}`, 14, 32);
        doc.text(`Period: ${start_year} – ${end_year}`, 14, 40);
        doc.text(`Hazard: Heatwave (95th percentile threshold: ${percentile_95}°C)`, 14, 48);

        doc.setTextColor(150, 160, 180);
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toISOString()}`, 14, 56);

        // Insight
        doc.setTextColor(255, 140, 50);
        doc.setFontSize(12);
        doc.text("Key Insight", 14, 68);
        doc.setTextColor(220, 230, 240);
        doc.setFontSize(9);
        const insightLines = doc.splitTextToSize(insight, 182);
        doc.text(insightLines, 14, 76);

        // Trend
        let y = 76 + insightLines.length * 5 + 8;
        doc.setTextColor(255, 140, 50);
        doc.setFontSize(12);
        doc.text("Trend Statistics", 14, y);
        doc.setTextColor(220, 230, 240);
        doc.setFontSize(9);
        y += 8;
        doc.text(`Direction: ${trend.direction}`, 14, y); y += 6;
        doc.text(`Slope: ${trend.slope.toFixed(4)} events/year`, 14, y); y += 6;
        doc.text(`Mann-Kendall tau: ${trend.mk_tau}`, 14, y); y += 6;
        doc.text(`Mann-Kendall p-value: ${trend.mk_p} (${trend.significant ? "statistically significant" : "not significant"})`, 14, y); y += 10;

        // Annual Stats Table
        doc.setTextColor(255, 140, 50);
        doc.setFontSize(12);
        doc.text("Annual Statistics", 14, y); y += 8;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text("Year", 14, y); doc.text("Events", 40, y); doc.text("Mean Duration (days)", 70, y); doc.text("Total Days", 150, y);
        y += 4;
        doc.setDrawColor(255, 140, 50, 0.3);
        doc.line(14, y, 196, y); y += 4;
        doc.setTextColor(200, 210, 225);

        for (const s of annual_stats.slice(0, 40)) {
            if (y > 275) { doc.addPage(); y = 20; doc.setFillColor(7, 13, 31); doc.rect(0, 0, 210, 297, "F"); }
            doc.text(String(s.year), 14, y);
            doc.text(String(s.count), 40, y);
            doc.text(String(s.mean_duration), 70, y);
            doc.text(String(s.total_days), 150, y);
            y += 5;
        }

        doc.save(`climate_report_${city_name}_${start_year}-${end_year}.pdf`);
    }

    return (
        <div className="export-row">
            <button id="export-events-csv" className="btn-export" onClick={exportCSV} disabled={disabled}>
                ⬇️ Events CSV
            </button>
            <button id="export-annual-csv" className="btn-export" onClick={exportAnnualCSV} disabled={disabled}>
                ⬇️ Annual Stats CSV
            </button>
            <button id="export-pdf" className="btn-export" onClick={exportPDF} disabled={disabled}>
                📄 PDF Report
            </button>
        </div>
    );
}
