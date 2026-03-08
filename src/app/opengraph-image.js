import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default function OgImage() {
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
          background: "#121212",
          gap: "24px",
        }}
      >
        {/* 로고 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "#4CAF50",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
            }}
          >
            📅
          </div>
          <span
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "#ffffff",
              letterSpacing: "-2px",
            }}
          >
            UnJ
          </span>
        </div>

        {/* 설명 */}
        <p
          style={{
            fontSize: "28px",
            color: "#aaaaaa",
            margin: "0",
          }}
        >
          모두가 가능한 시간을 찾아보세요
        </p>

        {/* URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#1e1e1e",
            padding: "10px 24px",
            borderRadius: "100px",
            border: "1px solid #333333",
          }}
        >
          <span style={{ fontSize: "18px", color: "#4CAF50" }}>●</span>
          <span style={{ fontSize: "20px", color: "#666666" }}>
            www.unj.kr
          </span>
        </div>
      </div>
    ),
    size
  );
}
