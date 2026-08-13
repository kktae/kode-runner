import React from "react";
import { useCurrentFrame, interpolate, Easing, staticFile } from "remotion";
import { Sparkles, Terminal, CheckCircle2 } from "lucide-react";

export const AgentStepShowcase: React.FC = () => {
  const frame = useCurrentFrame();

  const cubicEase = Easing.bezier(0.16, 1, 0.3, 1);

  // Slide 1: Sprint & Task execution (Frame 1280 - 1580, ~21s to 26s)
  const opacity1 = interpolate(frame, [1280, 1310, 1550, 1580], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale1 = interpolate(frame, [1280, 1310], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: cubicEase,
  });

  // Slide 2: Realtime Multiplayer Block Fall & Sync (Frame 1580 - 1880, ~26s to 31s)
  const opacity2 = interpolate(frame, [1580, 1610, 1850, 1880], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale2 = interpolate(frame, [1580, 1610], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: cubicEase,
  });

  // Slide 3: Mobile Touch Layout & Hold/Next Symmetrical Line (Frame 1880 - 2180, ~31s to 36s)
  const opacity3 = interpolate(frame, [1880, 1910, 2150, 2180], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale3 = interpolate(frame, [1880, 1910], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: cubicEase,
  });

  // Slide 4: Singleplayer Residual Board Bug Cleanup Verification (Frame 2180 - 2400, ~36s to 40s)
  const opacity4 = interpolate(frame, [2180, 2210], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale4 = interpolate(frame, [2180, 2210], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: cubicEase,
  });

  if (frame < 1280) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 360,
        right: 40,
        bottom: 20,
        zIndex: 500,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Step 1 Overlay Image */}
      {frame >= 1280 && frame <= 1580 && (
        <div
          style={{
            opacity: opacity1,
            transform: `scale(${scale1})`,
            width: "100%",
            height: "100%",
            backgroundColor: "#0D1117",
            borderRadius: 12,
            border: "2px solid #238636",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              backgroundColor: "#161B22",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #30363D",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Terminal size={16} color="#3FB950" />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#F0F6FC" }}>
                Step 1: Antigravity Plan Proceed & Task Execution
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(46, 160, 67, 0.2)",
                padding: "4px 10px",
                borderRadius: 6,
                color: "#3FB950",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={14} />
              <span>Sprint Plan Approved</span>
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <img
              src={staticFile("assets/user_steps/uploaded_media_0_1786611033790.png")}
              alt="Task execution"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>
      )}

      {/* Step 2 Overlay Image */}
      {frame >= 1580 && frame <= 1880 && (
        <div
          style={{
            opacity: opacity2,
            transform: `scale(${scale2})`,
            width: "100%",
            height: "100%",
            backgroundColor: "#0D1117",
            borderRadius: 12,
            border: "2px solid #38BDF8",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              backgroundColor: "#161B22",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #30363D",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Sparkles size={16} color="#38BDF8" />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#F0F6FC" }}>
                Step 2: 1v1 PvP Realtime Block Drop & Matrix Broadcast Fix
              </span>
            </div>
            <div
              style={{
                backgroundColor: "rgba(56, 189, 248, 0.18)",
                padding: "4px 10px",
                borderRadius: 6,
                color: "#38BDF8",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span>WebSocket 60fps Live Sync</span>
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <img
              src={staticFile("assets/user_steps/uploaded_media_0_1786612961535.png")}
              alt="PvP Realtime Block Sync"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>
      )}

      {/* Step 3 Overlay Image */}
      {frame >= 1880 && frame <= 2180 && (
        <div
          style={{
            opacity: opacity3,
            transform: `scale(${scale3})`,
            width: "100%",
            height: "100%",
            backgroundColor: "#0D1117",
            borderRadius: 12,
            border: "2px solid #FEE500",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              backgroundColor: "#161B22",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #30363D",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Sparkles size={16} color="#FEE500" />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#F0F6FC" }}>
                Step 3: Mobile Touch Controls Placement & Hold/Next Layout Fix
              </span>
            </div>
            <div
              style={{
                backgroundColor: "rgba(254, 229, 0, 0.18)",
                padding: "4px 10px",
                borderRadius: 6,
                color: "#FEE500",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span>Mobile Symmetrical Layout</span>
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <img
              src={staticFile("assets/user_steps/uploaded_media_0_1786605745050.png")}
              alt="Mobile Layout & Hold Next Fix"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>
      )}

      {/* Step 4 Overlay Image */}
      {frame >= 2180 && (
        <div
          style={{
            opacity: opacity4,
            transform: `scale(${scale4})`,
            width: "100%",
            height: "100%",
            backgroundColor: "#0D1117",
            borderRadius: 12,
            border: "2px solid #10B981",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              backgroundColor: "#161B22",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #30363D",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#F0F6FC" }}>
                Step 4: Singleplayer Residual Board Bug Complete Cleanup & GCP Cloud Run Live
              </span>
            </div>
            <div
              style={{
                backgroundColor: "#10B981",
                padding: "4px 10px",
                borderRadius: 6,
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <span>100% Verified & Deployed</span>
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <img
              src={staticFile("assets/user_steps/uploaded_media_0_1786611059142.png")}
              alt="Singleplayer Cleanup & Deployed"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
