"use client";

import { useState } from "react";
import { Button } from "antd";
import { User } from "@/types/user";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import styles from "@/styles/game/playerTable.module.css";
import pL from "@/styles/lobby/playerList.module.css"
import { HourglassOutlined } from "@ant-design/icons";

interface PlayerTableProps {
  currentTurn: "red" | "blue";
  currentPhase: string;
  remainingTime: number | null;
  blueSpymaster: User | null;
  redSpymaster: User | null;
  blueSpies: User[];
  redSpies: User[];
}

interface TeamCardProps {
  team: "BLUE" | "RED";
  currentPhase: string;
  currentTurn: "red" | "blue";
  spymaster: User | null;
  spies: User[];
  compact?: boolean;
}

function TeamCard({ team, currentTurn, currentPhase, spymaster, spies, compact }: TeamCardProps) {
  const isCurrentTurn =
    (team === "RED" && currentTurn === "red") ||
    (team === "BLUE" && currentTurn === "blue");

  const teamColor = team === "RED" ? "#E8401C" : "#1B9FD8";

  return (
    <div className={styles.teamCard} style={{ borderColor: teamColor }}>
      <span className={styles.teamBadge} style={{ background: teamColor }}>
        {team} {isCurrentTurn ? `• ${currentPhase === "SPYMASTER_TURN" ? "SPYMASTER" : "SPY"} PHASE` : ""}
      </span>

      <h3 className={styles.teamTitle}>
        {spymaster ? (
          <>
            🕵️ <span className={styles.breakName}>{spymaster.username}</span>
            {spymaster.isHost && (
              <span className={pL.hostBadge}>Host</span>
            )}
          </>
        ) : "Waiting..."}
      </h3>

      {!compact && spies.length > 0 && (
        <div className={styles.spyList}>
          {spies.map((spy) => (
            <div key={spy.id} className={styles.spyRow}>
              <span className={styles.breakName}>{spy.username}</span>
              {spy.isHost && (
                <span className={pL.hostBadge}>Host</span>
              )}
            </div>
          ))}
        </div>
      )}

      {!compact && spies.length === 0 && (
        <div className={styles.noSpies}>No spies yet</div>
      )}
    </div>
  );
}

export default function PlayerTable({
  currentTurn, currentPhase,
  remainingTime,
  blueSpymaster, redSpymaster, blueSpies, redSpies,
}: PlayerTableProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [expanded, setExpanded] = useState(false);

  const activeTeam = currentTurn === "blue" ? "BLUE" : "RED";
  const activeSpymaster = activeTeam === "BLUE" ? blueSpymaster : redSpymaster;
  const activeSpies = activeTeam === "BLUE" ? blueSpies : redSpies;

  const isWarning = remainingTime !== null && remainingTime <= 10 && remainingTime > 0;

  const formattedTime = (() => {
    if (remainingTime == null) return null;

    const hrs = Math.floor(remainingTime / 3600);
    const mins = Math.floor((remainingTime % 3600) / 60);
    const secs = remainingTime % 60;
    const partSecs = String(secs).padStart(2, "0");

    if (hrs > 0) {
      const partMins = String(mins).padStart(2, "0");
      return `${hrs}:${partMins}:${partSecs}`;
    }

    return `${mins}:${partSecs}`;
  })();

  // const formattedTime = remainingTime == null ? null
  //   : `${Math.max(0, Math.floor(remainingTime / 60))}:${String(Math.max(0, remainingTime % 60)).padStart(2, "0")}`;

  //const inactiveTeam = activeTeam === "BLUE" ? "RED" : "BLUE";
  //const inactiveSpymaster = activeTeam === "BLUE" ? redSpymaster : blueSpymaster;
  //const inactiveSpies = activeTeam === "BLUE" ? redSpies : blueSpies;

  const Timer = () => (
    formattedTime ? (
      <div className={`${styles.timerBadge} ${isWarning ? styles.timerWarning : ""}`}>
        <HourglassOutlined className={styles.timerIcon} />
        <span className={styles.timeText}>{formattedTime}</span>
      </div>
    ) : null
  );

  if (isMobile && !expanded) {
    return (
      <div className={styles.containerCollapsed}>
        <Timer />
        <TeamCard
          team={activeTeam}
          currentTurn={currentTurn}
          currentPhase={currentPhase}
          spymaster={activeSpymaster}
          spies={activeSpies}
          compact
        />
        <Button
          size="small"
          type="link"
          onClick={() => setExpanded(true)}
          className={styles.expandButton}
        >
          Show all players
        </Button>
      </div>
    );
  }

  return (
    <div className={isMobile ? styles.containerExpanded : styles.container}>
      <Timer />
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
      {isMobile && (
        <Button
          size="small"
          type="link"
          onClick={() => setExpanded(false)}
          className={styles.expandButton}
        >
          Collapse
        </Button>
      )}
    </div>
  );
}
