import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export const UserPromptArea: React.FC = () => {
  const frame = useCurrentFrame();

  // Prompt typing / reveal animation at 60fps (Starts at frame 20)
  const promptText =
    "카카오뱅크 Kode Runner 2026 행사의 부스에서 시연할 테트리스 웹게임을 생성해줘.";
  const typedLength = Math.min(
    promptText.length,
    Math.floor(
      interpolate(frame, [20, 140], [0, promptText.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  return (
    <div
      style={{
        backgroundColor: "#F0F2F5",
        borderRadius: 12,
        padding: "16px 20px",
        fontSize: 15,
        color: "#1F2328",
        fontWeight: 500,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif',
      }}
    >
      <span>
        {promptText.slice(0, typedLength)}
        {frame >= 20 && frame < 150 && (
          <span
            style={{
              opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0,
              color: "#0088FF",
              fontWeight: 700,
              marginLeft: 2,
            }}
          >
            |
          </span>
        )}
      </span>
    </div>
  );
};
