import { Button } from "antd";
import styles from "@/styles/gameActions.module.css";

interface GameActionsProps {
  role: string | null;
  cluePublished: boolean;
  canEndTurn: boolean;
  isSpymaster: boolean;
  colorOverlayActive: boolean;
  dictionaryLoading: boolean;
  onReport: () => void;
  onEndTurn: () => void;
  onToggleOverlay: () => void;
  onDictionary: () => void;
  onHowToPlay: () => void;
}

export default function GameActions({
  role, cluePublished, canEndTurn, isSpymaster,
  colorOverlayActive, dictionaryLoading,
  onReport, onEndTurn, onToggleOverlay, onDictionary, onHowToPlay,
}: GameActionsProps) {
  return (
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
  );
}