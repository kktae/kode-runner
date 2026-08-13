import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { FileText, Copy, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";

export const ImplementationPlanCard: React.FC = () => {
  const frame = useCurrentFrame();

  // Fast Snappy Appearance around frame 590
  const opacity = interpolate(frame, [590, 610], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [590, 620], [0.97, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  if (frame < 590) return null;

  // Fast Snappy Proceed button click animation at frame 650
  const isClicked = frame >= 650;
  const buttonScale = interpolate(
    frame,
    [640, 650, 660, 670],
    [1, 0.92, 1.05, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 8,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Plan Card Container */}
      <div
        style={{
          backgroundColor: "#F4F5F8",
          border: "1px solid #E2E4E8",
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={18} color="#2563EB" />
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1E293B" }}>
            Implementation Plan
          </span>
        </div>

        <span style={{ fontSize: 13.5, color: "#475569" }}>
          Implementation plan for KakaoBank Kode Runner 2026 Booth Tetris Web Game
        </span>

        {/* Action Button */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
          <button
            style={{
              transform: `scale(${buttonScale})`,
              backgroundColor: isClicked ? "#10B981" : "#0088FF",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontWeight: 700,
              fontSize: 13.5,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: isClicked
                ? "0 4px 12px rgba(16, 185, 129, 0.3)"
                : "0 4px 12px rgba(0, 136, 255, 0.25)",
              cursor: "pointer",
            }}
          >
            {isClicked ? (
              <>
                <CheckCircle2 size={15} color="#FFF" />
                <span>Plan Approved (Proceeding)</span>
              </>
            ) : (
              <>
                <span>Proceed</span>
                <span
                  style={{
                    backgroundColor: "rgba(255,255,255,0.25)",
                    fontSize: 11,
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  ⌘↵
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Right Icons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 16,
          color: "#94A3B8",
          paddingRight: 4,
        }}
      >
        <Copy size={16} style={{ cursor: "pointer" }} />
        <ThumbsUp size={16} style={{ cursor: "pointer" }} />
        <ThumbsDown size={16} style={{ cursor: "pointer" }} />
      </div>
    </div>
  );
};
