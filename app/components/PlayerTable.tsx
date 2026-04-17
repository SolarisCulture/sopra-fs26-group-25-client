"use client";

import React from "react";

interface PlayerListProps {
  currentTurn: "red" | "blue";
}

export default function PlayerList({ currentTurn }: PlayerListProps) {
  return (
    <div style={{
      width: "18vw",
      minWidth: "220px",
      display: "flex",
      flexDirection: "column",
      position: "absolute",
      right: "2vw",
      top: "15vh",
      zIndex: 100
    }}>
      <div style={{
        position: "relative",
        background: "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(12px)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        padding: "1.5vw",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "75vh"
      }}>
        <span style={{
          position: "absolute",
          top: "-10px",
          right: "15px",
          background: currentTurn == "red" ? "#E8401C" : "#1B9FD8",
          color: "#fff",
          fontSize: "10px",
          fontWeight: 800,
          padding: "2px 12px",
          borderRadius: "10px",
          letterSpacing: "0.5px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          whiteSpace: "nowrap",
          zIndex: 10
        }}>
          CURRENT TURN: {currentTurn == "red" ? "RED" : "BLUE"}
        </span>

        <h3 style={{
          fontSize: "clamp(16px, 1.2vw, 22px)",
          fontWeight: 700,
          color: "#fff",
          margin: "0 0 16px 0",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          paddingBottom: "0.8vw",
          width: "100%"
        }}>
          Players
        </h3>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {/* player table goes here */}
          <div style={{
            opacity: 0.5,
            fontStyle: "italic",
            textAlign: "center",
            padding: "20px 0",
            color: "white"
          }}>
            Waiting for players...
          </div>
        </div>
      </div>
    </div>
  );
}