import { ImageResponse } from "next/og";

export const socialImageSize = {
  width: 1200,
  height: 630,
} as const;

const nodePositions = [
  { left: 36, top: 44, size: 16 },
  { left: 224, top: 32, size: 12 },
  { left: 130, top: 154, size: 18 },
  { left: 286, top: 198, size: 14 },
  { left: 54, top: 292, size: 12 },
  { left: 220, top: 332, size: 18 },
] as const;

const routes = [
  { left: 48, top: 52, width: 188, rotate: "-4deg" },
  { left: 143, top: 166, width: 166, rotate: "15deg" },
  { left: 65, top: 300, width: 176, rotate: "13deg" },
] as const;

export function createSocialImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 64px",
        color: "#f3f0e8",
        backgroundColor: "#0b0c0c",
        backgroundImage:
          "linear-gradient(90deg, rgba(243,240,232,0.045) 1px, transparent 1px), linear-gradient(rgba(243,240,232,0.045) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#b8b5ad",
          fontSize: 20,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        <span>Infrastructure / Network 01</span>
        <span>Mumbai, India</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 700, display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#85f4c7", fontSize: 21, letterSpacing: 3, marginBottom: 24 }}>
            DCO TECH 3 / AWS
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 0.96,
              letterSpacing: -4,
            }}
          >
            <span>Rahul Singh</span>
            <span style={{ color: "#b8b5ad" }}>Parmar</span>
          </div>
          <div style={{ display: "flex", marginTop: 34, color: "#d7d4cc", fontSize: 24 }}>
            Networks&nbsp;&nbsp;/&nbsp;&nbsp;Security&nbsp;&nbsp;/&nbsp;&nbsp;Cloud&nbsp;&nbsp;/&nbsp;&nbsp;Automation
          </div>
        </div>

        <div
          style={{
            width: 360,
            height: 390,
            display: "flex",
            position: "relative",
            border: "1px solid rgba(133,244,199,0.35)",
            backgroundColor: "rgba(11,12,12,0.78)",
          }}
        >
          {routes.map((route, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: route.left,
                top: route.top,
                width: route.width,
                height: 2,
                backgroundColor: "rgba(133,244,199,0.5)",
                transform: `rotate(${route.rotate})`,
                transformOrigin: "left center",
              }}
            />
          ))}
          {nodePositions.map((node, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: node.left,
                top: node.top,
                width: node.size,
                height: node.size,
                display: "flex",
                borderRadius: 999,
                backgroundColor: index === 2 ? "#f3f0e8" : "#85f4c7",
                boxShadow: "0 0 0 7px rgba(133,244,199,0.08)",
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 34,
              bottom: 28,
              display: "flex",
              color: "#b8b5ad",
              fontSize: 16,
              letterSpacing: 3,
            }}
          >
            OPERATE / AUTOMATE / VERIFY
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 24,
          borderTop: "1px solid rgba(243,240,232,0.18)",
          color: "#b8b5ad",
          fontSize: 19,
          letterSpacing: 2,
        }}
      >
        <span>4+ years / infrastructure operations</span>
        <span style={{ color: "#85f4c7" }}>rahulsinghparmar.site</span>
      </div>
    </div>,
    socialImageSize,
  );
}
