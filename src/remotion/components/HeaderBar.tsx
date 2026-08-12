import React from "react";
import { ChevronLeft, ChevronRight, PanelLeft } from "lucide-react";

export const HeaderBar: React.FC = () => {
  return (
    <div
      style={{
        height: 38,
        width: "100%",
        backgroundColor: "#E8E8E8",
        borderBottom: "1px solid #D8D8D8",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        boxSizing: "border-box",
        userSelect: "none",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Left traffic light buttons & Nav buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#FF5F57",
              boxShadow: "inset 0 0 1px rgba(0,0,0,0.3)",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#FEB12F",
              boxShadow: "inset 0 0 1px rgba(0,0,0,0.3)",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#28C840",
              boxShadow: "inset 0 0 1px rgba(0,0,0,0.3)",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#666666" }}>
          <PanelLeft size={15} style={{ opacity: 0.8 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <ChevronLeft size={16} style={{ opacity: 0.7 }} />
            <ChevronRight size={16} style={{ opacity: 0.3 }} />
          </div>
        </div>
      </div>

      {/* Center Title */}
      <div style={{ fontSize: 13, fontWeight: 600, color: "#222222", letterSpacing: -0.2 }}>
        KakaoBank Kode Runner Tetris Game
      </div>

      {/* Right top indicator */}
      <div style={{ fontSize: 11, color: "#777777", fontWeight: 500 }}>
        Antigravity 2.0 • Bun Edition
      </div>
    </div>
  );
};
