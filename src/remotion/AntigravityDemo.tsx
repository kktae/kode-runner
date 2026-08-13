import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, staticFile } from "remotion";
import { HeaderBar } from "./components/HeaderBar";
import { Sidebar } from "./components/Sidebar";
import { UserPromptArea } from "./components/UserPromptArea";
import { WorkingProcess } from "./components/WorkingProcess";
import { PlanResponse } from "./components/PlanResponse";
import { ImplementationPlanCard } from "./components/ImplementationPlanCard";
import { ToolExecution } from "./components/ToolExecution";
import { ExecutionSuccessCard } from "./components/ExecutionSuccessCard";
import { AgentStepShowcase } from "./components/AgentStepShowcase";
import { MouseCursor } from "./components/MouseCursor";

export const AntigravityDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const cubicEase = Easing.bezier(0.16, 1, 0.3, 1);

  // Enhanced Camera Zoom-In focus onto main chat response content (1.42x close-up)
  // Zooms in during plan response, remains focused while Proceed clicked & tools run, then zooms out at completion
  const cameraScale = interpolate(
    frame,
    [0, 180, 220, 1900, 1960, 2400],
    [1.0, 1.0, 1.42, 1.42, 1.0, 1.0],
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
    [0, 25, 1200, 1260, 1900, 1960, 2400],
    [900, 420, 420, 380, 380, 950, 950],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: cubicEase,
    }
  );

  const mouseY = interpolate(
    frame,
    [0, 25, 1200, 1260, 1900, 1960, 2400],
    [500, 60, 60, 868, 868, 600, 600],
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
      {/* Prominent Semi-transparent Partner Brand Watermark Overlay */}
      <div
        style={{
          position: "absolute",
          top: 32,
          right: 40,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: "rgba(255, 255, 255, 0.88)",
          padding: "10px 22px",
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.45)",
          opacity: 0.85,
          backdropFilter: "blur(6px)",
          pointerEvents: "none",
        }}
      >
        <img
          src={staticFile("assets/MEGAZONECLOUD_NEW_CI_B.png")}
          alt="MEGAZONECLOUD"
          style={{ height: 28, width: "auto", display: "block" }}
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
                  overflowY: "auto",
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

                {/* Tool Execution Cards after Proceed Click */}
                <ToolExecution />

                {/* Final Task Completion & Cloud Run Deployment Result Card */}
                <ExecutionSuccessCard />
              </div>
            </div>
          </div>

          {/* User Image Step Showcase Slide Overlays */}
          <AgentStepShowcase />

          {/* Interactive Mouse Cursor nested INSIDE window for 100% pixel lockstep */}
          <MouseCursor x={mouseX} y={mouseY} clicking={isMouseClicking} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
