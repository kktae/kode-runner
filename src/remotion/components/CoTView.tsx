import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Brain, Sparkles, CheckCircle2, ChevronDown, Terminal, ChevronRight } from "lucide-react";

export const CoTView: React.FC = () => {
  const frame = useCurrentFrame();

  // CoT appears around frame 150
  const cotOpacity = interpolate(frame, [145, 160], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Collapse CoT slightly when tool output arrives to save space for game demo
  const isCollapsed = frame >= 430;
  const cotHeight = interpolate(frame, [150, 175, 430, 450], [0, 185, 185, 42], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Bullets appearing progressively
  const bullet1 = interpolate(frame, [165, 180], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bullet2 = interpolate(frame, [190, 205], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bullet3 = interpolate(frame, [215, 230], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bullet4 = interpolate(frame, [240, 255], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: cotOpacity,
        backgroundColor: "#FAFAFA",
        border: "1px solid #E2E4E9",
        borderRadius: 12,
        padding: "10px 16px",
        height: cotHeight,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: isCollapsed ? "none" : "1px solid #EDEDED",
          paddingBottom: isCollapsed ? 0 : 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Brain size={16} color="#7C3AED" />
          <span style={{ fontWeight: 600, fontSize: 13, color: "#4C1D95" }}>
            Chain of Thought (CoT) — Gemini 3.6 Flash High
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              backgroundColor: isCollapsed ? "#E1F5FE" : "#F3E8FF",
              padding: "2px 8px",
              borderRadius: 12,
              fontSize: 11,
              color: isCollapsed ? "#0288D1" : "#6B21A8",
              fontWeight: 600,
            }}
          >
            <Sparkles size={11} color={isCollapsed ? "#0288D1" : "#6B21A8"} />
            <span>{isCollapsed ? "Thought Process Completed (4 steps)" : "Thinking..."}</span>
          </div>
        </div>
        {isCollapsed ? (
          <ChevronRight size={16} color="#888" />
        ) : (
          <ChevronDown size={16} color="#888" />
        )}
      </div>

      {/* Thought Steps */}
      {!isCollapsed && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            fontSize: 12.5,
            color: "#374151",
            lineHeight: "1.4",
          }}
        >
          <div
            style={{
              opacity: bullet1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transform: `translateY(${(1 - bullet1) * 6}px)`,
            }}
          >
            <CheckCircle2 size={13} color="#10B981" />
            <span>
              <b>이벤트 요구사항 분석:</b> 카카오뱅크 Kode Runner 2026 행사의 부스 시연용 고성능 미니 게임 Planning
            </span>
          </div>

          <div
            style={{
              opacity: bullet2,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transform: `translateY(${(1 - bullet2) * 6}px)`,
            }}
          >
            <CheckCircle2 size={13} color="#10B981" />
            <span>
              <b>브랜딩 & UI 디자인:</b> 카카오뱅크 시그니처 옐로우(#FEE500) + 네온 라임(#39FF14) + 고화질 캔버스 러너
            </span>
          </div>

          <div
            style={{
              opacity: bullet3,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transform: `translateY(${(1 - bullet3) * 6}px)`,
            }}
          >
            <CheckCircle2 size={13} color="#10B981" />
            <span>
              <b>패키지 관리자 정책 (엄격 적용):</b>{" "}
              <code style={{ backgroundColor: "#F3F4F6", padding: "1px 5px", borderRadius: 4, color: "#D97706", fontWeight: 700 }}>
                Bun 1.3.14
              </code>{" "}
              전용 빌드 파이프라인 (npm/npx 절대 금지)
            </span>
          </div>

          <div
            style={{
              opacity: bullet4,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transform: `translateY(${(1 - bullet4) * 6}px)`,
            }}
          >
            <Terminal size={13} color="#3B82F6" />
            <span>
              <b>실행 계획:</b> Vite TypeScript 템플릿 생성 → GSAP & Confetti 설치 → 게임 엔진 및 리더보드 컴포넌트 구성
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
