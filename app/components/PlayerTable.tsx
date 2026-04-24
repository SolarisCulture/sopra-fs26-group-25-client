"use client";

import { Turn } from "@/types/turn";
import { User } from "@/types/user"

interface PlayerTableProps {
  currentTurn: "red" | "blue"
  currentPhase: string
  blueSpymaster: User | null
  redSpymaster: User | null
  blueSpies: User[]
  redSpies: User[]
}

interface TeamCardProps {
  team: "BLUE" | "RED"
  currentPhase: string
  currentTurn: "red" | "blue"
  spymaster: User | null
  spies: User[]
}

function TeamCard({ team, currentTurn, currentPhase, spymaster, spies }: TeamCardProps) {
  const isCurrentTurn =
    (team === "RED" && currentTurn === "red") ||
    (team === "BLUE" && currentTurn === "blue")

  const teamColor = team === "RED" ? "#E8401C" : "#1B9FD8"

  const spyRowHeight = 36
  const spyGap = 6
  const maxVisibleSpies = 4
  const spyListMaxHeight =
    maxVisibleSpies * spyRowHeight + (maxVisibleSpies - 1) * spyGap

  return (
    <div
      style={{
        position: "relative",
        background: "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(12px)",
        borderRadius: "16px",
        border: `1px solid ${teamColor}`,
        padding: "18px 16px 14px 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        minHeight: "220px"
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "-10px",
          right: "15px",
          background: teamColor,
          color: "#fff",
          fontSize: "10px",
          fontWeight: 800,
          padding: "2px 12px",
          borderRadius: "10px",
          letterSpacing: "0.5px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          whiteSpace: "nowrap",
          zIndex: 10
        }}
      >
        {team} {isCurrentTurn ? `• CURRENT TURN • ${currentPhase == "SPYMASTER_TURN" ? "SPYMASTER-PHASE" : "SPY-PHASE"}` : ""}
      </span>

      <h3
        style={{
          fontSize: "clamp(20px, 1.5vw, 28px)",
          fontWeight: 800,
          color: "#fff",
          margin: "0 0 14px 0",
          borderBottom: "1px solid rgba(255, 255, 255, 0.22)",
          paddingBottom: "12px",
          width: "100%",
          lineHeight: 1.15,
          textAlign: "center",
          textShadow: "0 2px 8px rgba(0,0,0,0.25)"
        }}
      >
        {spymaster ? (
          <>
            {spymaster.isHost && <span>👑 </span>}
            🕵️ <span style={{ wordBreak: "break-all" }}>{spymaster.username}</span>
          </>
        ) : "Waiting for spymaster..."}
      </h3>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0
        }}
      >
        {spies.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: `${spyGap}px`,
              maxHeight: `${spyListMaxHeight}px`,
              overflowY: "auto",
              paddingRight: "4px"
            }}
          >
            {spies.map((spy) => (
              <div
                key={spy.id}
                style={{
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: "8px",
                  height: `${spyRowHeight}px`,
                  minHeight: `${spyRowHeight}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: 1.2,
                  textAlign: "center",
                  padding: "0 10px"
                }}
              >
                {spy.isHost && <span style={{ marginRight: 6 }}>👑</span>}
                <span style={{ flex: 1, textAlign: "center", wordBreak: "break-all" }}>{spy.username}</span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              opacity: 0.6,
              fontStyle: "italic",
              textAlign: "center",
              padding: "16px 0",
              color: "white",
              fontSize: "14px"
            }}
          >
            No spies yet
          </div>
        )}
      </div>
    </div>
  )
}

export default function PlayerTable({
  currentTurn,
  currentPhase,
  blueSpymaster,
  redSpymaster,
  blueSpies,
  redSpies
}: PlayerTableProps) {
  return (
    <div
      style={{
        width: "18vw",
        minWidth: "220px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: "absolute",
        right: "2vw",
        top: "24px",
        zIndex: 100,
      }}
    >
      <TeamCard
        team="BLUE"
        currentTurn={currentTurn}
        currentPhase={currentPhase}
        spymaster={blueSpymaster}
        spies={blueSpies}
      />

      <TeamCard
        team="RED"
        currentTurn={currentTurn}
        currentPhase={currentPhase}
        spymaster={redSpymaster}
        spies={redSpies}
      />
    </div>
  )
}
