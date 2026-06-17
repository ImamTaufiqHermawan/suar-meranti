import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SuarMeranti — Kotak Saran & Aspirasi Warga Bukit Meranti";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #4A90A4 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            marginBottom: 16,
          }}
        >
          Suar<span style={{ color: "#C9A227" }}>Meranti</span>
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.85)",
            marginBottom: 8,
          }}
        >
          Kotak Saran & Aspirasi Warga
        </div>
        <div style={{ fontSize: 24, color: "rgba(255,255,255,0.65)" }}>
          Cluster Bukit Meranti · Citra Indah City Jonggol
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 20,
            color: "#C9A227",
            fontWeight: 600,
          }}
        >
          Suara Warga, Harmoni Komunitas
        </div>
      </div>
    ),
    { ...size },
  );
}
