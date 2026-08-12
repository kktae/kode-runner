import React from "react";

interface MouseCursorProps {
  x: number;
  y: number;
  clicking?: boolean;
}

export const MouseCursor: React.FC<MouseCursorProps> = ({ x, y, clicking }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 9999,
        transform: `scale(${clicking ? 0.82 : 1})`,
        transition: "transform 0.08s ease-out",
      }}
    >
      {/* Click ripple animation ring */}
      {clicking && (
        <div
          style={{
            position: "absolute",
            top: -12,
            left: -12,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "2px solid #0088FF",
            backgroundColor: "rgba(0, 136, 255, 0.25)",
            animation: "pulse 0.2s ease-out",
          }}
        />
      )}
      {/* Realistic macOS Pointer SVG */}
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0px 3px 6px rgba(0,0,0,0.4))" }}
      >
        <path
          d="M5.5 3.5L18.5 13.5H11.5L16 20.5L13 21.5L8.5 14.5L5.5 17.5V3.5Z"
          fill="black"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
