import { Button } from "antd";
import styles from "@/styles/game/gameActions.module.css";

interface GameActionsProps {
  role: string | null;
  cluePublished: boolean;
  canEndTurn: boolean;
  isHost: boolean;
  isSpymaster: boolean;
  colorOverlayActive: boolean;
  dictionaryLoading: boolean;
  onReport: () => void;
  onEndTurn: () => void;
  onToggleOverlay: () => void;
  onDictionary: () => void;
  onHowToPlay: () => void;
  onPause: () => void;
  onQuit: () => void;
}

export default function GameActions({
  role, cluePublished, canEndTurn, isHost, isSpymaster,
  colorOverlayActive, dictionaryLoading,
  onReport, onEndTurn, onToggleOverlay, onDictionary, onHowToPlay, onPause, onQuit,
}: GameActionsProps) {
  return (
    <>
      {isHost && (
        <div className={styles.hostControls}>
          <Button type="primary" onClick={onPause} className={styles.actionButton}>
            Pause Game
          </Button>
          <Button type="primary" onClick={onQuit} className={styles.actionButton}>
            Quit Game
          </Button>
        </div>
      )}

      <div className={styles.container}>
        {isSpymaster && (
        <Button
          type={colorOverlayActive ? "default" : "primary"}
          onClick={onToggleOverlay}
          className={styles.actionButton}
        >
          {colorOverlayActive ? "Hide Key" : "Show Key"}
        </Button>
      )}

      <Button
        type="primary"
        disabled={!cluePublished}
        onClick={onReport}
        className={styles.actionButton}
      >
        Report Clue
      </Button>

      {role === "SPY" && (
        <Button
          type="primary"
          onClick={onEndTurn}
          disabled={!canEndTurn}
          className={styles.actionButton}
        >
          End Turn
        </Button>
      )}

      <Button
        type="primary"
        onClick={onDictionary}
        loading={dictionaryLoading}
        className={styles.actionButton}
      >
        Dictionary
      </Button>

      <Button
        type="primary"
        onClick={onHowToPlay}
        className={styles.actionButton}
      >
        How To Play
      </Button>
      </div>
    </>
  );
}
