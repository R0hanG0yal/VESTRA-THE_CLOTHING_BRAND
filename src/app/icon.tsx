import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#0d0d10",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f4f1ea",
          fontFamily: "Georgia, serif",
          fontWeight: 700,
          border: "1px solid rgba(244, 241, 234, 0.2)",
        }}
      >
        V
      </div>
    ),
    {
      ...size,
    }
  );
}
