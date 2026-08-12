import React from "react";
import {
  Plus,
  History,
  Calendar,
  Settings,
  SlidersHorizontal,
  PlusSquare,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  return (
    <div
      style={{
        width: 250,
        backgroundColor: "#EFEFEF",
        borderRight: "1px solid #E0E0E0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "12px 10px",
        boxSizing: "border-box",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* New Conversation Button */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 8,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "#1F2328",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            border: "1px solid #E5E5E5",
            cursor: "pointer",
          }}
        >
          <Plus size={15} color="#555" />
          <span>New Conversation</span>
        </div>

        {/* Quick Menu Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 4 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "#444444",
              fontWeight: 500,
            }}
          >
            <History size={15} color="#666" />
            <span>Conversation History</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "#444444",
              fontWeight: 500,
            }}
          >
            <Calendar size={15} color="#666" />
            <span>Scheduled Tasks</span>
          </div>
        </div>

        {/* Projects Section (Cleaned / Emptied) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "#888888",
              padding: "0 4px",
            }}
          >
            <span>Projects</span>
            <div style={{ display: "flex", gap: 6 }}>
              <SlidersHorizontal size={13} color="#888" />
              <PlusSquare size={13} color="#888" />
            </div>
          </div>

          <div
            style={{
              paddingLeft: 4,
              fontSize: 12,
              color: "#A0A0A0",
              fontStyle: "italic",
            }}
          >
            No active projects
          </div>
        </div>

        {/* Conversations Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "#888888",
              padding: "0 4px",
            }}
          >
            <span>Conversations</span>
            <Plus size={14} color="#888" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Active Conversation Item Only */}
            <div
              style={{
                backgroundColor: "#E2E3E5",
                borderRadius: 6,
                padding: "6px 8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#111111",
              }}
            >
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 160,
                }}
              >
                KakaoBank Kode Runner Tetr...
              </span>
              <span style={{ fontSize: 11, color: "#777777", fontWeight: 500 }}>
                1m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Settings */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          color: "#444444",
          fontWeight: 500,
          padding: "8px 4px 4px 4px",
          borderTop: "1px solid #E0E0E0",
          marginTop: 10,
        }}
      >
        <Settings size={16} color="#666" />
        <span>Settings</span>
      </div>
    </div>
  );
};
