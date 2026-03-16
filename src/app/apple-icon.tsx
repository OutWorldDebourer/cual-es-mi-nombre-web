import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d9488, #007382)",
          borderRadius: "40px",
        }}
      >
        <svg width="100" height="100" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 4l2.5 8.5L27 16l-8.5 2.5L16 27l-2.5-8.5L5 16l8.5-2.5z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
