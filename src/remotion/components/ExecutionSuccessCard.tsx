import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { CheckCircle, ExternalLink, Globe, Server, Sparkles } from "lucide-react";

export const ExecutionSuccessCard: React.FC = () => {
  const frame = useCurrentFrame();

  // Appears at Frame 1550 (after deploy script completes)
  const opacity = interpolate(frame, [1550, 1580], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [1550, 1590], [0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  if (frame < 1550) return null;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        backgroundColor: "#F8FAFC",
        border: "1.5px solid #10B981",
        borderRadius: 12,
        padding: "18px 22px",
        marginTop: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 8px 24px rgba(16, 185, 129, 0.12)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Title Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            backgroundColor: "#10B981",
            borderRadius: "50%",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle size={18} color="#FFFFFF" />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#065F46" }}>
            모든 태스크 성공 완료 및 GCP 배포 성공!
          </span>
          <span style={{ fontSize: 12.5, color: "#047857" }}>
            Antigravity 에이전트가 모든 요청 사항을 완벽하게 검증 및 반영하였습니다.
          </span>
        </div>
      </div>

      {/* Deployment URLs Box */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 8,
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Globe size={15} color="#2563EB" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>
              커스텀 도메인 서비스:
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", fontFamily: "monospace" }}>
              https://kode-runner.com
            </span>
            <ExternalLink size={13} color="#2563EB" />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Server size={15} color="#64748B" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
              Cloud Run Direct URL:
            </span>
          </div>
          <span style={{ fontSize: 12, color: "#64748B", fontFamily: "monospace" }}>
            https://kode-runner-service-kpoo6att3a-du.a.run.app
          </span>
        </div>
      </div>

      {/* Completion Badge Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          backgroundColor: "#ECFDF5",
          padding: "6px 12px",
          borderRadius: 6,
          width: "fit-content",
          color: "#047857",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <Sparkles size={14} color="#10B981" />
        <span>100% Zero-Error Verification & Deployed Successfully</span>
      </div>
    </div>
  );
};
