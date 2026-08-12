import React from "react";
import { Player } from "@remotion/player";
import { AntigravityDemo } from "../remotion/AntigravityDemo";

interface RemotionModalProps {
  onClose: () => void;
}

export const RemotionModal: React.FC<RemotionModalProps> = ({ onClose }) => {
  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        className="modal-card glass-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "92vw",
          maxWidth: 1280,
          height: "85vh",
          maxHeight: 760,
          backgroundColor: "#161B22",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 16,
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          color: "#FFFFFF",
        }}
      >
        {/* Modal Top Header Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                color: "#FFDE00",
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: "0.5px",
                display: "block",
                marginBottom: 2,
              }}
            >
              kakaobank
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#F0F6FC" }}>
              Antigravity 2.0 - AI 생성 과정 시연
            </h2>
            <p style={{ fontSize: 13, color: "#8B949E", margin: "4px 0 0 0" }}>
              인터랙티브 비디오 시연
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "#F0F6FC",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
          >
            닫기
          </button>
        </div>

        {/* Remotion Player Canvas Container */}
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            borderRadius: 12,
            backgroundColor: "#0D0F14",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Player
            component={AntigravityDemo}
            durationInFrames={1500}
            compositionWidth={1920}
            compositionHeight={1080}
            fps={60}
            controls
            autoPlay
            loop
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
};
