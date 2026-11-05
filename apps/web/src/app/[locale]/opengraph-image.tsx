import { ImageResponse } from "next/og";

export const alt = "ProsParity";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fff", padding: 72, color: "#004737" }}>
        <div style={{ fontSize: 40, fontWeight: 600 }}>ProsParity</div>
        <div style={{ fontSize: 84, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2 }}>Good batteries make good loans.</div>
      </div>
    ),
    size,
  );
}
