import React from "react";

interface SanitizedMacDockProps {
  activeIconScale?: number;
  opacity?: number;
}

export const SanitizedMacDock: React.FC<SanitizedMacDockProps> = ({
  activeIconScale = 1,
  opacity = 1,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(255, 255, 255, 0.22)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255, 255, 255, 0.35)",
        borderRadius: 24,
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow:
          "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.6)",
        opacity,
        transition: "opacity 0.3s ease",
        zIndex: 100,
      }}
    >
      {/* 1. Finder (Authentic 3D macOS Smiling Face) */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "linear-gradient(180deg, #3CA4FF 0%, #1763E8 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glossy Diagonal Half */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "50%", background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%)" }} />
        <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
          <path d="M7 11C7 9.89543 7.89543 9 9 9H23C24.1046 9 25 9.89543 25 11V21C25 22.1046 24.1046 23 23 23H9C7.89543 23 7 22.1046 7 21V11Z" fill="#1C65E3" />
          <path d="M11 13V15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M21 13V15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M11 19C13 21 19 21 21 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* 2. Launchpad */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "radial-gradient(circle at 30% 30%, #F5F5F7 0%, #C0C4CC 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
          {["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#007AFF", "#5856D6", "#AF52DE", "#FF2D55", "#A2845E"].map((col, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: col }} />
          ))}
        </div>
      </div>

      {/* 3. Safari */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "linear-gradient(180deg, #24B0FF 0%, #005EEB 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="13" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
          <polygon points="16,8 19,16 16,24 13,16" fill="#FF3B30" />
          <polygon points="16,24 19,16 16,8 13,16" fill="white" />
        </svg>
      </div>

      {/* 4. Terminal */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "linear-gradient(180deg, #2C2D32 0%, #111215 100%)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "3px 3px 0 0", marginBottom: 4 }} />
        <div style={{ fontSize: 13, fontFamily: "monospace", color: "#34C759", fontWeight: "bold", width: "100%", paddingLeft: 4 }}>
          &gt;_
        </div>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 42, backgroundColor: "rgba(255,255,255,0.3)", margin: "0 2px" }} />

      {/* 5. Antigravity 2.0 (Official Glossy App Icon) */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <div
          style={{
            width: 54,
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(180deg, #181D29 0%, #0B0D14 100%)",
            border: "1.5px solid #0088FF",
            boxShadow:
              "0 8px 24px rgba(0, 136, 255, 0.45), 0 0 15px rgba(0, 136, 255, 0.3), inset 0 1px 1px rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            transform: `scale(${activeIconScale})`,
            transition: "transform 0.1s ease",
            overflow: "hidden",
          }}
        >
          {/* Glowing Star Logo */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
              fill="url(#antigravityGradient)"
              filter="drop-shadow(0px 2px 6px rgba(0,136,255,0.8))"
            />
            <defs>
              <linearGradient id="antigravityGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00C6FF" />
                <stop offset="1" stopColor="#0072FF" />
              </linearGradient>
            </defs>
          </svg>

          {/* Yellow Version Badge */}
          <div
            style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              backgroundColor: "#FFDE00",
              borderRadius: 4,
              padding: "1px 4px",
              fontSize: 8,
              fontWeight: 900,
              color: "#000",
              boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            2.0
          </div>
        </div>
        {/* macOS Active App Dot */}
        <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#FFFFFF", opacity: 0.9 }} />
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 42, backgroundColor: "rgba(255,255,255,0.3)", margin: "0 2px" }} />

      {/* 6. VS Code */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "linear-gradient(180deg, #007ACC 0%, #004E8A 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M17.5 3L8.5 10.5L3.5 6.5L1.5 8L6.5 12L1.5 16L3.5 17.5L8.5 13.5L17.5 21L21.5 19V5L17.5 3Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 7. Settings */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "linear-gradient(180deg, #8E8E93 0%, #525257 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2.5" strokeDasharray="3 3" />
          <circle cx="12" cy="12" r="3" fill="white" />
        </svg>
      </div>

      {/* 8. Trash */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)",
          border: "1px solid rgba(255,255,255,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </div>
    </div>
  );
};
