import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Mic, ArrowUp, Plus, ChevronDown, User, Sparkles } from "lucide-react";

interface PromptInputAreaProps {
  promptText: string;
}

export const PromptInputArea: React.FC<PromptInputAreaProps> = ({ promptText }) => {
  const frame = useCurrentFrame();

  // Phase 1 (0 - 120): Initial centered input box typing
  // Typing progress from frame 20 to 105
  const typedLength = Math.floor(
    interpolate(frame, [20, 105], [0, promptText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const currentTypedText = promptText.substring(0, typedLength);

  // Submit button press effect at frame 110-120
  const submitScale = interpolate(frame, [110, 115, 120], [1, 0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Transition from central input box to conversation thread at frame 120-145
  const transitionProgress = interpolate(frame, [120, 145], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const isThreadMode = frame >= 120;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      {!isThreadMode ? (
        /* Central Input View (Initial state matching uploaded image) */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 100,
            gap: 20,
            userSelect: "none",
            width: "100%",
          }}
        >
          {/* Header Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 18,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            <span>New Conversation</span>
            <ChevronDown size={18} color="#6B7280" />
          </div>

          {/* Input Box Card */}
          <div style={{ width: "88%", maxWidth: 820, position: "relative" }}>
            <div
              style={{
                backgroundColor: "#F3F4F6",
                border: "1px solid #E5E7EB",
                borderRadius: 18,
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 24,
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              }}
            >
              {/* Text Input area */}
              <div
                style={{
                  fontSize: 16,
                  color: currentTypedText ? "#111827" : "#9CA3AF",
                  fontWeight: 500,
                  minHeight: 32,
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Pretendard", sans-serif',
                  lineHeight: "1.5",
                }}
              >
                {currentTypedText || "Ask anything, @ to mention, / for actions"}
                {/* Blinking cursor */}
                <span
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: 18,
                    backgroundColor: "#2563EB",
                    marginLeft: 2,
                    verticalAlign: "middle",
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                  }}
                />
              </div>

              {/* Bottom bar inside card */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* Model Badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "#E5E7EB",
                    padding: "6px 12px",
                    borderRadius: 14,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  <Plus size={14} color="#4B5563" />
                  <span>Gemini 3.6 Flash High</span>
                  <ChevronDown size={14} color="#6B7280" />
                </div>

                {/* Right controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Mic size={18} color="#6B7280" />
                  <div
                    style={{
                      transform: `scale(${submitScale})`,
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      backgroundColor: typedLength > 0 ? "#111827" : "#E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background-color 0.2s",
                      boxShadow: typedLength > 0 ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                    }}
                  >
                    <ArrowUp
                      size={18}
                      color={typedLength > 0 ? "#FFFFFF" : "#9CA3AF"}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-label under box */}
            <div
              style={{
                position: "absolute",
                right: 8,
                bottom: -24,
                fontSize: 12,
                color: "#6B7280",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>Main Agent</span>
              <ChevronDown size={13} color="#6B7280" />
            </div>
          </div>
        </div>
      ) : (
        /* Conversation Mode (User Prompt as Chat Message) */
        <div
          style={{
            opacity: transitionProgress,
            transform: `translateY(${(1 - transitionProgress) * -10}px)`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* User Message Bubble */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              alignSelf: "flex-end",
              maxWidth: "85%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                alignSelf: "flex-end",
              }}
            >
              <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>User</span>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: "#E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <User size={15} color="#374151" />
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                padding: "12px 18px",
                borderRadius: "18px 18px 4px 18px",
                fontSize: 15,
                fontWeight: 500,
                lineHeight: "1.5",
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)",
              }}
            >
              {promptText}
            </div>
          </div>

          {/* Agent Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                backgroundColor: "#7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={15} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
              Antigravity Agent • Gemini 3.6 Flash High
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
