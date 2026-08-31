import { ImageResponse } from "next/og";

export function createBrandIcon(size: number) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#f3f0e8",
        backgroundColor: "#0b0c0c",
        border: `${Math.max(2, Math.round(size / 32))}px solid #85f4c7`,
        fontFamily: "Arial, sans-serif",
        fontSize: Math.round(size * 0.34),
        fontWeight: 700,
        letterSpacing: Math.max(1, Math.round(size * 0.015)),
      }}
    >
      RSP
    </div>,
    { width: size, height: size },
  );
}
