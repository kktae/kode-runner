import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Trophy, Play, QrCode, Zap, Sparkles, Cpu, Award } from "lucide-react";

export const GameOutput: React.FC = () => {
  const frame = useCurrentFrame();

  // Appears frame 440 onwards
  const cardOpacity = interpolate(frame, [440, 460], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardScale = interpolate(frame, [440, 470], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  if (frame < 435) return null;

  // Frame relative to game start
  const gameFrame = Math.max(0, frame - 460);

  // Score counter animating upwards
  const currentScore = Math.floor(
    interpolate(gameFrame, [0, 250], [12000, 158400], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Runner x position and jump y cycle
  const jumpOffset = Math.abs(Math.sin(gameFrame * 0.15)) * 36;
  const trackOffset = (gameFrame * 18) % 100;

  // Floating particles / coins cycle
  const coin1X = (gameFrame * 12) % 550;
  const coin2X = ((gameFrame * 12) + 220) % 550;

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
        backgroundColor: "#111113",
        border: "2px solid #FEE500",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 12px 36px rgba(254, 229, 0, 0.25)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", sans-serif',
        color: "#FFFFFF",
        marginTop: 4,
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          backgroundColor: "#FEE500",
          color: "#191919",
          padding: "8px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "-0.02em",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} color="#191919" />
          <span>카카오뱅크 KODE RUNNER 2026 — BOOTH DEMO</span>
          <span
            style={{
              backgroundColor: "#191919",
              color: "#FEE500",
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            READY FOR VISITORS
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
          <Zap size={13} color="#191919" />
          <span>BUN BUILD ACTIVE</span>
        </div>
      </div>

      {/* Main Game Screen + Leaderboard Layout */}
      <div style={{ display: "flex", height: 215, position: "relative" }}>
        {/* Left Side: Game Canvas */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#191919",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          {/* Game Stats Overlay */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 10, color: "#999999", fontWeight: 600 }}>
                BOOTH HIGH SCORE
              </span>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#FEE500",
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                {currentScore.toLocaleString()} <span style={{ fontSize: 12 }}>PTS</span>
              </span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  padding: "3px 10px",
                  borderRadius: 6,
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 9, color: "#AAA", display: "block" }}>
                  COMBO
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#39FF14" }}>
                  18x
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  padding: "3px 10px",
                  borderRadius: 6,
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 9, color: "#AAA", display: "block" }}>
                  TIME
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#00E5FF",
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  00:48
                </span>
              </div>
            </div>
          </div>

          {/* Canvas Background Track */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(180deg, #12131C 0%, #191919 60%, #2A2402 100%)",
            }}
          >
            {/* Speed Grid Lines */}
            <div
              style={{
                position: "absolute",
                bottom: 30,
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: "#FEE500",
                boxShadow: "0 0 10px #FEE500",
              }}
            />

            {/* Moving Ground Lines */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: -trackOffset,
                width: "200%",
                height: 30,
                background:
                  "repeating-linear-gradient(90deg, #FEE500 0px, #FEE500 16px, transparent 16px, transparent 48px)",
                opacity: 0.3,
              }}
            />

            {/* Floating Collectible Coins */}
            <div
              style={{
                position: "absolute",
                bottom: 50,
                right: coin1X,
                backgroundColor: "#FEE500",
                color: "#000",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 10,
                boxShadow: "0 0 8px #FEE500",
              }}
            >
              $
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 95,
                right: coin2X,
                backgroundColor: "#39FF14",
                color: "#000",
                borderRadius: 4,
                padding: "2px 5px",
                fontWeight: 800,
                fontSize: 9,
                boxShadow: "0 0 8px #39FF14",
              }}
            >
              CODE+1000
            </div>

            {/* Obstacle Bug */}
            <div
              style={{
                position: "absolute",
                bottom: 32,
                right: ((gameFrame * 15) % 450) + 40,
                backgroundColor: "#FF3366",
                color: "#FFF",
                borderRadius: 4,
                padding: "2px 6px",
                fontSize: 9,
                fontWeight: 800,
              }}
            >
              🐛 404 Bug
            </div>

            {/* Character Runner (Ryan / Kode Runner Avatar) */}
            <div
              style={{
                position: "absolute",
                bottom: 32 + jumpOffset,
                left: 70,
                width: 38,
                height: 40,
                backgroundColor: "#FEE500",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(254, 229, 0, 0.8)",
                border: "2px solid #FFFFFF",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 10,
                  backgroundColor: "#191919",
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                }}
              >
                <div style={{ width: 3, height: 3, backgroundColor: "#FFF", borderRadius: "50%" }} />
                <div style={{ width: 3, height: 3, backgroundColor: "#FFF", borderRadius: "50%" }} />
              </div>
              <span style={{ fontSize: 8, fontWeight: 900, color: "#191919", marginTop: 1 }}>
                RUNNER
              </span>
            </div>

            {/* Floating Jump Popup */}
            {jumpOffset > 15 && (
              <div
                style={{
                  position: "absolute",
                  bottom: 80 + jumpOffset,
                  left: 60,
                  color: "#39FF14",
                  fontWeight: 900,
                  fontSize: 11,
                  textShadow: "0 0 6px #39FF14",
                }}
              >
                PERFECT JUMP!
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Booth Leaderboard Widget */}
        <div
          style={{
            width: 200,
            backgroundColor: "#121214",
            borderLeft: "1px solid #222226",
            padding: "10px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              color: "#FEE500",
            }}
          >
            <Trophy size={13} />
            <span>BOOTH LEADERBOARD</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {/* 1st Place */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(254, 229, 0, 0.12)",
                border: "1px solid rgba(254, 229, 0, 0.3)",
                padding: "4px 6px",
                borderRadius: 5,
                fontSize: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Award size={12} color="#FEE500" />
                <span style={{ fontWeight: 700, color: "#FFF" }}>Ryan_Dev</span>
              </div>
              <span style={{ fontWeight: 800, color: "#FEE500" }}>152.0K</span>
            </div>

            {/* 2nd Place (You) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(57, 255, 20, 0.15)",
                border: "1px solid rgba(57, 255, 20, 0.4)",
                padding: "4px 6px",
                borderRadius: 5,
                fontSize: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontWeight: 800, color: "#39FF14" }}>2nd</span>
                <span style={{ fontWeight: 700, color: "#FFF" }}>You (Visitor)</span>
              </div>
              <span style={{ fontWeight: 800, color: "#39FF14" }}>
                {(currentScore / 1000).toFixed(1)}K
              </span>
            </div>

            {/* 3rd Place */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.03)",
                padding: "4px 6px",
                borderRadius: 5,
                fontSize: 10,
                color: "#AAA",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span>3rd</span>
                <span>Apeach_Coder</span>
              </div>
              <span>98.4K</span>
            </div>
          </div>

          <div
            style={{
              marginTop: "auto",
              backgroundColor: "#1A1A1E",
              padding: 6,
              borderRadius: 5,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 9,
              color: "#888",
            }}
          >
            <QrCode size={18} color="#FEE500" />
            <span>Scan to play on mobile!</span>
          </div>
        </div>
      </div>

      {/* Footer Controls & Bun Meta */}
      <div
        style={{
          backgroundColor: "#18181C",
          borderTop: "1px solid #282830",
          padding: "8px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            style={{
              backgroundColor: "#FEE500",
              color: "#191919",
              border: "none",
              borderRadius: 5,
              padding: "5px 12px",
              fontWeight: 800,
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              gap: 5,
              cursor: "pointer",
            }}
          >
            <Play size={12} fill="#191919" />
            <span>Run Booth Game</span>
          </button>
          <span style={{ fontSize: 10, color: "#888888" }}>
            Press SPACE or TAP to Jump
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#A0A0A0" }}>
          <Cpu size={12} color="#FEE500" />
          <span>
            Powered by <b style={{ color: "#FFF" }}>Bun 1.3.14</b> • Zero npm dependencies
          </span>
        </div>
      </div>
    </div>
  );
};
