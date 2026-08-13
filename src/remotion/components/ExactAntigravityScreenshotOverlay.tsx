import React from "react";
import { useCurrentFrame, interpolate, staticFile } from "remotion";

export const ExactAntigravityScreenshotOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  // Transition parameters (Starts exactly after frame 1260 - Proceed click)
  // Image 1: Executing Implementation Plan CoT & File edits (Frame 1270 - 1800)
  const opacity1 = interpolate(frame, [1270, 1300, 1770, 1800], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Image 2: Command Execution & User Input Prompt Modal (Frame 1800 - 2400)
  const opacity2 = interpolate(frame, [1800, 1830], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < 1270) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 38, // Directly below HeaderBar
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 600,
        backgroundColor: "#FFFFFF",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* First Antigravity Screenshot: Executing Plan & File Edits */}
      {frame >= 1270 && frame <= 1800 && (
        <div
          style={{
            opacity: opacity1,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            backgroundColor: "#F8F9FA",
          }}
        >
          <img
            src={staticFile("assets/antigravity_screenshots/uploaded_media_0_1786613543080.png")}
            alt="Antigravity Executing Implementation Plan"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "top center",
            }}
          />
        </div>
      )}

      {/* Second Antigravity Screenshot: Command Execution & Modal Option Prompt */}
      {frame >= 1800 && (
        <div
          style={{
            opacity: opacity2,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            backgroundColor: "#F8F9FA",
          }}
        >
          <img
            src={staticFile("assets/antigravity_screenshots/uploaded_media_1_1786613543080.png")}
            alt="Antigravity Command Execution & Options Modal"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "top center",
            }}
          />
        </div>
      )}
    </div>
  );
};
