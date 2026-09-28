import { ImageResponse } from "next/og";

export const alt = "VESTRA Atelier — Architectural Business Tailoring & Modern Silhouette";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0d0d10",
          backgroundImage:
            "linear-gradient(to bottom, #131318 0%, #0d0d10 100%)",
          padding: "80px 96px",
          border: "1px solid rgba(244, 241, 234, 0.12)",
          textAlign: "left",
        }}
      >
        {/* Top Folio Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: "rgba(244, 241, 234, 0.5)",
              marginBottom: 16,
              textAlign: "left",
            }}
          >
            VESTRA // ATELIER SUITE · FOLIO 2026
          </div>
          <div
            style={{
              fontSize: 32,
              fontFamily: "Georgia, serif",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#f4f1ea",
              textAlign: "left",
            }}
          >
            VESTRA
          </div>
        </div>

        {/* Center Editorial Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            textAlign: "left",
            maxWidth: "960px",
            borderLeft: "3px solid #f4f1ea",
            paddingLeft: "36px",
          }}
        >
          <div
            style={{
              fontSize: 58,
              fontFamily: "Georgia, serif",
              color: "#f4f1ea",
              lineHeight: 1.15,
              fontWeight: 400,
              textAlign: "left",
            }}
          >
            Architectural Drapery. Modern Silhouette.
          </div>
          <div
            style={{
              fontSize: 20,
              fontFamily: "sans-serif",
              color: "rgba(244, 241, 234, 0.7)",
              marginTop: 20,
              lineHeight: 1.5,
              textAlign: "left",
            }}
          >
            Calibrated business tailoring, 3D spatial fitting, and pigment harmony designed for the contemporary form.
          </div>
        </div>

        {/* Bottom Rail Metadata */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid rgba(244, 241, 234, 0.15)",
            paddingTop: 28,
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontFamily: "monospace",
                color: "rgba(244, 241, 234, 0.45)",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                textAlign: "left",
              }}
            >
              Statutory Fiduciary
            </span>
            <span
              style={{
                fontSize: 13,
                fontFamily: "monospace",
                color: "#f4f1ea",
                marginTop: 4,
                textAlign: "left",
              }}
            >
              VESTRA ATELIER PVT. LTD. · MUMBAI, INDIA
            </span>
          </div>

          <div
            style={{
              fontSize: 12,
              fontFamily: "monospace",
              color: "rgba(244, 241, 234, 0.6)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              textAlign: "left",
            }}
          >
            DPDP ACT COMPLIANT · PCI-DSS VERIFIED
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
