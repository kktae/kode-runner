import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Terminal, FileCode2, Check, Zap } from "lucide-react";

export const ToolExecution: React.FC = () => {
  const frame = useCurrentFrame();

  // Cards appearing from frame 270 onwards
  const card1 = interpolate(frame, [270, 285], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const card2 = interpolate(frame, [310, 325], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const card3 = interpolate(frame, [350, 365], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const card4 = interpolate(frame, [410, 425], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < 265) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Pretendard", "JetBrains Mono", sans-serif',
      }}
    >
      {/* Card 1: bun create vite */}
      <div
        style={{
          opacity: card1,
          transform: `translateY(${(1 - card1) * 8}px)`,
          backgroundColor: "#18181B",
          color: "#F4F4F5",
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Zap size={14} color="#FEE500" />
          <span style={{ color: "#A1A1AA" }}>run_command</span>
          <code style={{ color: "#FEE500", fontWeight: 600 }}>
            bun create vite kakaobank-kode-runner --template vanilla-ts
          </code>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: "#10B981",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <Check size={13} />
          <span>Completed in 112ms</span>
        </div>
      </div>

      {/* Card 2: bun add packages */}
      {frame >= 305 && (
        <div
          style={{
            opacity: card2,
            transform: `translateY(${(1 - card2) * 8}px)`,
            backgroundColor: "#18181B",
            color: "#F4F4F5",
            borderRadius: 8,
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={14} color="#FEE500" />
            <span style={{ color: "#A1A1AA" }}>run_command</span>
            <code style={{ color: "#38BDF8", fontWeight: 600 }}>
              bun add gsap canvas-confetti howler lucide-react
            </code>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "#10B981",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Check size={13} />
            <span>Installed (bun v1.3.14) in 68ms</span>
          </div>
        </div>
      )}

      {/* Card 3: write_to_file code snippet */}
      {frame >= 345 && (
        <div
          style={{
            opacity: card3,
            transform: `translateY(${(1 - card3) * 8}px)`,
            backgroundColor: "#0F172A",
            border: "1px solid #1E293B",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              backgroundColor: "#1E293B",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 11,
              color: "#94A3B8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FileCode2 size={13} color="#38BDF8" />
              <span>write_to_file — src/engine/KakaoKodeRunner.ts</span>
            </div>
            <span style={{ color: "#FEE500", fontWeight: 600 }}>TypeScript</span>
          </div>
          <pre
            style={{
              margin: 0,
              padding: "10px 14px",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11.5,
              lineHeight: "1.5",
              color: "#E2E8F0",
              overflowX: "hidden",
            }}
          >
            <span style={{ color: "#F43F5E" }}>export class</span>{" "}
            <span style={{ color: "#FEE500" }}>KakaoKodeRunner</span> &#123;{"\n"}
            {"  "}speed = <span style={{ color: "#38BDF8" }}>2.5</span>;{"\n"}
            {"  "}score = <span style={{ color: "#38BDF8" }}>0</span>;{"\n"}
            {"  "}boothMode = <span style={{ color: "#F43F5E" }}>true</span>;{"\n\n"}
            {"  "}<span style={{ color: "#10B981" }}>// KakaoBank 2026 Booth Event Game Loop</span>{"\n"}
            {"  "}<span style={{ color: "#38BDF8" }}>onCollectCodeCube</span>() &#123;{"\n"}
            {"    "}<span style={{ color: "#F43F5E" }}>this</span>.score += <span style={{ color: "#38BDF8" }}>1000</span>;{"\n"}
            {"    "}<span style={{ color: "#FEE500" }}>Confetti</span>.triggerBoothSparkles();{"\n"}
            {"  "}&#125;{"\n"}
            &#125;
          </pre>
        </div>
      )}

      {/* Card 4: bun run build */}
      {frame >= 405 && (
        <div
          style={{
            opacity: card4,
            transform: `translateY(${(1 - card4) * 8}px)`,
            backgroundColor: "#18181B",
            color: "#F4F4F5",
            borderRadius: 8,
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Terminal size={14} color="#10B981" />
            <span style={{ color: "#A1A1AA" }}>run_command</span>
            <code style={{ color: "#10B981", fontWeight: 600 }}>bun run build</code>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "#FEE500",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <span>✨ Build Success in 0.34s!</span>
          </div>
        </div>
      )}
    </div>
  );
};
