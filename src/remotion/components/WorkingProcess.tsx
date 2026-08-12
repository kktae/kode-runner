import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ChevronDown, Folder, FileText } from "lucide-react";

export const WorkingProcess: React.FC = () => {
  const frame = useCurrentFrame();

  // Appears around frame 160
  const opacity = interpolate(frame, [160, 190], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < 160) return null;

  // Progressive reveal at 60 FPS
  const step1 = frame >= 190;
  const step2 = frame >= 230;
  const step3 = frame >= 270;
  const step4 = frame >= 310;

  // Streamed thought text for Designing Project Structure
  const thoughtText =
    "I'm currently focused on architecting the foundation for the project. My thoughts are gravitating towards either a robust Vite-powered React app with HTML5 Canvas, or a lean, modular web application featuring a comprehensive suite of custom elements like an audio synthesizer, Canvas engine, and particle effects, alongside a leaderboard and sound design.";

  const thoughtTypedLength = Math.min(
    thoughtText.length,
    Math.floor(
      interpolate(frame, [330, 500], [0, thoughtText.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  const step5 = frame >= 510;

  return (
    <div
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontSize: 13.5,
        color: "#555555",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif',
        paddingLeft: 4,
      }}
    >
      {/* Worked for 23s */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
        <span>Worked for 23s</span>
        <ChevronDown size={14} color="#777" />
      </div>

      {/* Explored 1 folder */}
      {step1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 16 }}>
          <span>Explored 1 folder</span>
          <ChevronDown size={13} color="#888" />
        </div>
      )}

      {/* Thought for 6s */}
      {step2 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 24 }}>
          <span>Thought for 6s</span>
          <ChevronDown size={13} color="#888" />
        </div>
      )}

      {/* Analyzed folder */}
      {step3 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 24 }}>
          <span>Analyzed</span>
          <Folder size={14} color="#666" />
          <code style={{ backgroundColor: "#EAECEF", padding: "2px 6px", borderRadius: 4, fontSize: 12.5 }}>
            ~/.gemini/antigravity/scratch
          </code>
        </div>
      )}

      {/* Thought for 7s & Designing Project Structure (STREAMING TYPING EFFECT) */}
      {step4 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>Thought for 7s</span>
            <ChevronDown size={13} color="#888" />
          </div>

          <div
            style={{
              backgroundColor: "#F7F8FA",
              borderLeft: "3px solid #D0D3D9",
              padding: "10px 14px",
              borderRadius: "0 8px 8px 0",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              color: "#333333",
              maxWidth: 820,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13 }}>Designing Project Structure</span>
            <span style={{ fontSize: 12.5, color: "#555555", lineHeight: 1.5 }}>
              {thoughtText.slice(0, thoughtTypedLength)}
              {frame >= 330 && frame < 510 && (
                <span
                  style={{
                    opacity: Math.floor(frame / 10) % 2 === 0 ? 1 : 0,
                    color: "#0088FF",
                    fontWeight: 700,
                    marginLeft: 2,
                  }}
                >
                  ▌
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Edited Implementation Plan */}
      {step5 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 24, marginTop: 4 }}>
          <span>Edited</span>
          <FileText size={14} color="#444" />
          <span style={{ fontWeight: 700, color: "#111111" }}>Implementation Plan</span>
        </div>
      )}
    </div>
  );
};
