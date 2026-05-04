import { Button } from "antd";
import type { CSSProperties } from "react";
import { WordCard } from "@/types/wordCard";
import styles from "@/styles/game.module.css";

interface GameOverScreenProps {
  winningTeam: string | null;
  finalBoard: WordCard[];
  isHost: boolean;
  isRestarting: boolean;
  onRestart: () => void;
  onBackToLobby: () => void;
}

export default function GameOverScreen({
  winningTeam, finalBoard, isHost, isRestarting, onRestart, onBackToLobby,
}: GameOverScreenProps) {
  const getFinalCardStyle = (card: WordCard): CSSProperties => {
    const colors = {
      AGENTRED: {
        background: card.revealed ? "#E8401C" : "rgba(232, 64, 28, 0.4)",
        border: card.revealed ? "#FF8A70" : "rgba(232, 64, 28, 0.35)",
      },
      AGENTBLUE: {
        background: card.revealed ? "#1b9fd8" : "rgba(27, 159, 216, 0.4)",
        border: card.revealed ? "#7BD3FF" : "rgba(27, 159, 216, 0.35)",
      },
      ASSASSIN: {
        background: card.revealed ? "#222222" : "rgba(0, 0, 0, 0.4)",
        border: card.revealed ? "#666666" : "rgba(0, 0, 0, 0.35)",
      },
      CIVILIAN: {
        background: card.revealed ? "#C4B49A" : "rgba(196, 180, 154, 0.4)",
        border: card.revealed ? "#F0E8D0" : "rgba(196, 180, 154, 0.35)",
      },
    }[card.cardType];

    return {
      background: colors?.background,
      border: `3px solid ${colors?.border}`,
    };
  };

  return (
    <div className={styles.finishedBackdrop}>
      <div className={styles.finishedBox}>
        <h2 className={styles.finishedTitle}>Game Over</h2>
        <p className={styles.finishedText}>
          {winningTeam ? `Team ${winningTeam} has won the game!` : "The game has ended."}
        </p>
        <div className={styles.finalBoard}>
          {finalBoard.map((card, index) => (
            <div
              key={`${card.word}-${index}`}
              className={styles.finalCard}
              style={getFinalCardStyle(card)}
            >
              {card.word}
            </div>
          ))}
        </div>
        {isHost ? (
          <div className={styles.finishedButtons}>
            <Button onClick={onRestart} loading={isRestarting} disabled={isRestarting}>
              {isRestarting ? "Restarting..." : "Restart"}
            </Button>
            <Button onClick={onBackToLobby} disabled={isRestarting}>
              Return to Lobby
            </Button>
          </div>
        ) : (
          <p className={styles.finishedText}>
            Waiting for the host to choose what happens next.
          </p>
        )}
      </div>
    </div>
  );
}
