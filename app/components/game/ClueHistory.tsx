import { useState } from "react";
import { Button } from "antd";
import styles from "@/styles/game/clueHistory.module.css";

interface Props {
  clueHistory: { word: string; count: number; team: "red" | "blue" }[];
}

export default function ClueHistory({ clueHistory }: Props) {
  const [expanded, setExpanded] = useState(false);
  const latest = clueHistory[0] ?? null;
  const older = clueHistory.slice(1);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Clue History</h3>

      {!latest && (
        <span className={styles.empty}>Waiting for clues...</span>
      )}

      {latest && (
        <div
          className={`${styles.clueCard} ${styles.latestCard}`}
          style={{ borderLeftColor: latest.team === "red" ? "#ff4d4f" : "#1890ff" }}
        >
          <span
            className={styles.latestBadge}
            style={{ background: latest.team === "red" ? "#ff4d4f" : "#1890ff" }}
          >
            LATEST CLUE
          </span>
          <div className={styles.clueRow}>
            <span className={styles.clueWord}>{latest.word}</span>
            <span className={styles.clueCount}>{latest.count}</span>
          </div>
          <span className={styles.clueTeam}>Team {latest.team}</span>
        </div>
      )}

      {older.length > 0 && (
        <>
          <Button
            size="small"
            type="link"
            onClick={() => setExpanded(!expanded)}
            className={styles.toggleButton}
          >
            {expanded ? "Hide history" : `Show ${older.length} more`}
          </Button>

          {expanded && (
            <div className={styles.olderList}>
              {older.map((h, i) => (
                <div
                  key={i}
                  className={styles.clueCard}
                  style={{ borderLeftColor: h.team === "red" ? "#ff4d4f" : "#1890ff" }}
                >
                  <div className={styles.clueRow}>
                    <span className={styles.clueWord}>{h.word}</span>
                    <span className={styles.clueCount}>{h.count}</span>
                  </div>
                  <span className={styles.clueTeam}>Team {h.team}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
