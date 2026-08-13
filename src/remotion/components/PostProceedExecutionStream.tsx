import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ChevronDown, ChevronRight, FileCode2 } from "lucide-react";

export const PostProceedExecutionStream: React.FC = () => {
  const frame = useCurrentFrame();

  // Active after frame 650 (Fast Proceed click)
  if (frame < 650) return null;

  // Relative frame count starting from frame 650
  const relFrame = frame - 650;

  // 1. Texts for Fast Snappy Streaming
  const introText =
    "The user has greenlit the plan. My focus now shifts to the meticulous, step-by-step construction of the ultra-polished Vite, React, and HTML5 Canvas Tetris application. This includes ensuring high performance and aesthetic appeal within the specified directory.";

  const projStructureText =
    "I'm now focused on meticulously creating the foundational directory and files for the Tetris application. This involves setting up package.json, Vite configuration, the main HTML and CSS, and the entry point for the React application, alongside the core engine and component files.";

  const leaderboardText =
    "I'm currently working on the LeaderboardModal.jsx component. My focus is on implementing the functionality to save scores using localStorage and then display the top rankings.";

  const commandText = "npm install && npm run build";

  // 2. High-Speed Character Interpolations (Fast & Snappy)
  const introTypedLen = Math.min(
    introText.length,
    Math.floor(
      interpolate(relFrame, [10, 75], [0, introText.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  const projTypedLen = Math.min(
    projStructureText.length,
    Math.floor(
      interpolate(relFrame, [80, 145], [0, projStructureText.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  const leaderboardTypedLen = Math.min(
    leaderboardText.length,
    Math.floor(
      interpolate(relFrame, [320, 370], [0, leaderboardText.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  const commandTypedLen = Math.min(
    commandText.length,
    Math.floor(
      interpolate(relFrame, [390, 430], [0, commandText.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  // 3. Fast Rhythmic File Edit Stream Configuration (8~12 frames per item)
  const fileEdits = [
    { name: "package.json", lines: "+29 -0", startF: 150, endF: 160 },
    { name: "vite.config.js", lines: "+11 -0", startF: 162, endF: 172 },
    { name: "tailwind.config.js", lines: "+50 -0", startF: 174, endF: 184 },
    { name: "postcss.config.js", lines: "+7 -0", startF: 186, endF: 196 },
    { name: "index.html", lines: "+19 -0", startF: 198, endF: 208 },
    { name: "index.css", lines: "+74 -0", startF: 210, endF: 220 },
    { type: "thought", text: "Thought for 7s", startF: 222 },
    { name: "SoundManager.js", lines: "+198 -0", startF: 228, endF: 238 },
    { type: "thought", text: "Thought for 6s", startF: 240 },
    { name: "ParticleEngine.js", lines: "+160 -0", startF: 246, endF: 256 },
    { type: "thought", text: "Thought for 18s", startF: 258 },
    { name: "TetrisEngine.js", lines: "+479 -0", startF: 264, endF: 274 },
    { type: "thought", text: "Thought for 3s", startF: 276 },
    { name: "AiDemoPlayer.js", lines: "+142 -0", startF: 282, endF: 292 },
    { type: "thought", text: "Thought for 8s", startF: 294 },
    { name: "HeaderHUD.jsx", lines: "+190 -0", startF: 300, endF: 310 },
    { name: "SidePanels.jsx", lines: "+108 -0", startF: 312, endF: 320 },
    { name: "GameBoard.jsx", lines: "+210 -0", startF: 322, endF: 330 },
    { name: "LeaderboardModal.jsx", lines: "+168 -0", startF: 375, endF: 385 },
    { type: "thought", text: "Thought for 5s", startF: 388 },
    { name: "BoothControls.jsx", lines: "+83 -0", startF: 390, endF: 398 },
    { name: "App.jsx", lines: "+176 -0", startF: 400, endF: 408 },
    { name: "main.jsx", lines: "+11 -0", startF: 410, endF: 418 },
  ];

  // Blinking Typing Cursor (▌)
  const isCursorVisible = Math.floor(frame / 6) % 2 === 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        paddingTop: 16,
        paddingBottom: 40,
        color: "#1F2328",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* 1. CoT Accordion Header */}
      {relFrame >= 5 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#6366F1",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <ChevronDown size={15} />
          <span>Thought for 4s</span>
        </div>
      )}

      {/* 2. Executing Implementation Plan Heading */}
      {relFrame >= 5 && (
        <div style={{ color: "#57609A", fontSize: 13, fontWeight: 600 }}>
          Executing Implementation Plan
        </div>
      )}

      {/* 3. Fast Intro Sentence Streaming */}
      {relFrame >= 10 && (
        <div
          style={{
            fontSize: 13.5,
            lineHeight: "1.6",
            color: "#24292F",
            maxWidth: 1100,
          }}
        >
          <span>{introText.slice(0, introTypedLen)}</span>
          {relFrame >= 10 && relFrame < 75 && isCursorVisible && (
            <span
              style={{
                color: "#0088FF",
                fontWeight: 700,
                marginLeft: 2,
              }}
            >
              ▌
            </span>
          )}
        </div>
      )}

      {/* 4. Establishing Project Structure */}
      {relFrame >= 78 && (
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "#1F2328",
            marginTop: 8,
          }}
        >
          Establishing Project Structure
        </div>
      )}

      {relFrame >= 80 && (
        <div
          style={{
            fontSize: 13.5,
            lineHeight: "1.6",
            color: "#24292F",
            maxWidth: 1100,
          }}
        >
          <span>{projStructureText.slice(0, projTypedLen)}</span>
          {relFrame >= 80 && relFrame < 145 && isCursorVisible && (
            <span
              style={{
                color: "#0088FF",
                fontWeight: 700,
                marginLeft: 2,
              }}
            >
              ▌
            </span>
          )}
        </div>
      )}

      {/* 5. Fast Streamed File Edits List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginTop: 6,
        }}
      >
        {fileEdits.map((item, idx) => {
          if (relFrame < item.startF) return null;

          if (item.type === "thought") {
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#6E7781",
                  fontSize: 12.5,
                  padding: "3px 0",
                }}
              >
                <ChevronRight size={14} />
                <span>{item.text}</span>
              </div>
            );
          }

          const name = item.name || "";
          const lines = item.lines || "";
          const itemFullStr = `Edited ${name} ${lines}`;
          const endF = item.endF ?? item.startF + 10;
          const isCurrentlyTyping = relFrame >= item.startF && relFrame < endF;
          const typedProgress = Math.min(
            itemFullStr.length,
            Math.floor(
              interpolate(
                relFrame,
                [item.startF, endF],
                [0, itemFullStr.length],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )
            )
          );

          const isFinishedTyping = relFrame >= endF;

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                padding: "2px 0",
              }}
            >
              <span style={{ color: "#6E7781" }}>Edited</span>
              <FileCode2 size={14} color="#0969DA" />
              <span style={{ fontWeight: 600, color: "#1F2328" }}>
                {isFinishedTyping ? name : name.slice(0, Math.max(0, typedProgress - 7))}
              </span>
              <span style={{ color: "#1A7F37", fontWeight: 600, fontSize: 12, marginLeft: 4 }}>
                {isFinishedTyping ? lines : lines.slice(0, Math.max(0, typedProgress - 7 - name.length))}
              </span>
              {isCurrentlyTyping && isCursorVisible && (
                <span style={{ color: "#0088FF", fontWeight: 700 }}>▌</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 6. Developing Leaderboard Feature Heading & Streaming Text */}
      {relFrame >= 315 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginTop: 12,
            marginBottom: 6,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14.5, color: "#1F2328" }}>
            Developing Leaderboard Feature
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#57609A",
              lineHeight: "1.5",
              maxWidth: 1100,
            }}
          >
            <span>{leaderboardText.slice(0, leaderboardTypedLen)}</span>
            {relFrame >= 320 && relFrame < 370 && isCursorVisible && (
              <span
                style={{
                  color: "#0088FF",
                  fontWeight: 700,
                  marginLeft: 2,
                }}
              >
                ▌
              </span>
            )}
          </div>
        </div>
      )}

      {/* 7. Terminal Command Block with Live Prompt Typing */}
      {relFrame >= 385 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "#1F2328",
            }}
          >
            <span>Run npm install && npm run build?</span>
            <ChevronDown size={14} color="#6E7781" />
          </div>

          <div
            style={{
              backgroundColor: "#F6F8FA",
              border: "1px solid #D0D7DE",
              borderRadius: 8,
              padding: "10px 16px",
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
              fontSize: 13,
              color: "#1F2328",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ color: "#6E7781" }}>
              ~/.../kakaobank-kode-runner-tetris $
            </span>
            <span style={{ color: "#CF222E", fontWeight: 600 }}>
              {commandText.slice(0, commandTypedLen)}
            </span>
            {relFrame >= 390 && relFrame < 430 && isCursorVisible && (
              <span style={{ color: "#0088FF", fontWeight: 700 }}>▌</span>
            )}
          </div>

          {relFrame >= 435 && (
            <div style={{ color: "#6E7781", fontSize: 12.5 }}>
              Waiting for user input...
            </div>
          )}
        </div>
      )}

      {/* 8. Permission Options Modal Card */}
      {relFrame >= 440 && (
        <div
          style={{
            backgroundColor: "#F6F8FA",
            border: "1px solid #D0D7DE",
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            maxWidth: 1100,
            marginTop: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600,
              fontSize: 14,
              color: "#1F2328",
            }}
          >
            <FileCode2 size={16} color="#0969DA" />
            <span>
              Allow installing dependencies and building Vite project?
            </span>
          </div>

          <div
            style={{
              backgroundColor: "#EAEEF2",
              padding: "8px 14px",
              borderRadius: 6,
              fontFamily: "monospace",
              fontSize: 12.5,
              color: "#1F2328",
            }}
          >
            npm install && npm run build
          </div>

          {/* Options List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                backgroundColor: "#E2E8F0",
                border: "1px solid #0969DA",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                color: "#1F2328",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  backgroundColor: "#0969DA",
                  color: "#FFFFFF",
                  borderRadius: 4,
                  padding: "1px 6px",
                  fontSize: 11,
                }}
              >
                1
              </span>
              <span>Yes, allow this time</span>
            </div>

            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D0D7DE",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                color: "#57609A",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  backgroundColor: "#F3F4F6",
                  color: "#57609A",
                  borderRadius: 4,
                  padding: "1px 6px",
                  fontSize: 11,
                }}
              >
                2
              </span>
              <span>
                Yes, and always allow 'npm install' in this conversation
              </span>
            </div>

            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D0D7DE",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                color: "#57609A",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  backgroundColor: "#F3F4F6",
                  color: "#57609A",
                  borderRadius: 4,
                  padding: "1px 6px",
                  fontSize: 11,
                }}
              >
                3
              </span>
              <span>
                Yes, and always allow 'npm install' when not in a project
              </span>
            </div>

            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D0D7DE",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                color: "#57609A",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  backgroundColor: "#F3F4F6",
                  color: "#57609A",
                  borderRadius: 4,
                  padding: "1px 6px",
                  fontSize: 11,
                }}
              >
                4
              </span>
              <span>Yes, and always allow 'npm install'</span>
            </div>
          </div>

          {/* Action Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
              marginTop: 4,
            }}
          >
            <span
              style={{
                color: "#57609A",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Skip
            </span>
            <button
              style={{
                backgroundColor: "#0969DA",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 6,
                padding: "6px 16px",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <span>Submit</span>
              <span style={{ fontSize: 11, opacity: 0.8 }}>↵</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
