import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, staticFile } from "remotion";
import { HeaderBar } from "./components/HeaderBar";
import { Sidebar } from "./components/Sidebar";
import { UserPromptArea } from "./components/UserPromptArea";
import { WorkingProcess } from "./components/WorkingProcess";
import { PlanResponse } from "./components/PlanResponse";
import { ImplementationPlanCard } from "./components/ImplementationPlanCard";
import { MouseCursor } from "./components/MouseCursor";

export const AntigravityDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const cubicEase = Easing.bezier(0.16, 1, 0.3, 1);

  // Enhanced Camera Zoom-In focus onto main chat response content (1.28x close-up)
  const cameraScale = interpolate(
    frame,
    [0, 180, 220, 1420, 1460, 1500],
    [1.0, 1.0, 1.28, 1.28, 1.0, 1.0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: cubicEase,
    }
  );

  // Precise Mouse Cursor Trajectory inside the App Window coordinate system
  // Prompt Area Input Center -> (X: 420, Y: 60)
  // Proceed Button Center    -> (X: 380, Y: 868)
  const mouseX = interpolate(
    frame,
    [0, 25, 1200, 1260, 1500],
    [900, 420, 420, 380, 380],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: cubicEase,
    }
  );

  const mouseY = interpolate(
    frame,
    [0, 25, 1200, 1260, 1500],
    [500, 60, 60, 868, 868],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: cubicEase,
    }
  );

  const isMouseClicking =
    (frame >= 15 && frame <= 35) || (frame >= 1255 && frame <= 1275);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0D0F14",
        backgroundImage:
          "radial-gradient(circle at 50% 30%, #1E2230 0%, #08090D 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif',
        overflow: "hidden",
      }}
    >
      {/* Semi-transparent Partner Brand Watermark Overlay */}
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 32,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          padding: "6px 14px",
          borderRadius: 8,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
          opacity: 0.75,
          backdropFilter: "blur(4px)",
          pointerEvents: "none",
        }}
      >
        <img
          src={staticFile("assets/MEGAZONECLOUD_NEW_CI_B.png")}
          alt="MEGAZONECLOUD"
          style={{ height: 16, width: "auto", display: "block" }}
        />
      </div>

      {/* Antigravity 2.0 App Window with Camera Scaling Focus */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${cameraScale})`,
          transformOrigin: "55% 48%",
        }}
      >
        {/* App Window Frame */}
        <div
          style={{
            width: 1840,
            height: 1000,
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            boxShadow:
              "0 30px 90px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* macOS Header Bar */}
          <HeaderBar />

          {/* Main Split Content View */}
          <div style={{ display: "flex", flex: 1, height: "calc(100% - 38px)" }}>
            {/* Left Sidebar */}
            <Sidebar />

            {/* Right Main Chat Area */}
            <div
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Main Chat Container */}
              <div
                style={{
                  flex: 1,
                  padding: "20px 50px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  overflow: "hidden",
                }}
              >
                {/* User Input Prompt */}
                <UserPromptArea />

                {/* Working Process / CoT Steps */}
                <WorkingProcess />

                {/* Text Plan Response */}
                <PlanResponse />

                {/* Implementation Plan Artifact Card & Proceed Button */}
                <ImplementationPlanCard />
              </div>
            </div>
          </div>

          {/* Interactive Mouse Cursor nested INSIDE window for 100% pixel lockstep */}
          <MouseCursor x={mouseX} y={mouseY} clicking={isMouseClicking} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
