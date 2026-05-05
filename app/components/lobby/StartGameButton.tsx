import { Button } from "antd";
import styles from "@/styles/lobby/lobby.module.css";

interface StartGameButtonProps {
  allAssigned: boolean;
  isStarting: boolean;
  onStart: () => void;
}

export default function StartGameButton({
  allAssigned, isStarting, onStart,
}: StartGameButtonProps) {
  return (
    <div className={styles.startWrapper}>
      <Button
        type="primary"
        className={styles.startButton}
        loading={isStarting}
        disabled={!allAssigned || isStarting}
        style={{ opacity: allAssigned ? 1 : 0.4 }}
        onClick={onStart}
      >
        Start Game
      </Button>
    </div>
  );
}
