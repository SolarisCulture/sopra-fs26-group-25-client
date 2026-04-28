import { Button } from "antd";
import styles from "@/styles/game.module.css";

interface GameOverScreenProps {
  winningTeam: string | null;
  isHost: boolean;
  isRestarting: boolean;
  onRestart: () => void;
  onBackToLobby: () => void;
}

export default function GameOverScreen({
  winningTeam, isHost, isRestarting, onRestart, onBackToLobby,
}: GameOverScreenProps) {
  return (
    <div className={styles.finishedBackdrop}>
      <div className={styles.finishedBox}>
        <h2 className={styles.finishedTitle}>Game Over</h2>
        <p className={styles.finishedText}>
          {winningTeam ? `Team ${winningTeam} has won the game!` : "The game has ended."}
        </p>
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