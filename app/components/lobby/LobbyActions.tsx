import { Button } from "antd";
import styles from "@/styles/lobby/lobby.module.css";

interface LobbyActionsProps {
  onSettings: () => void;
  onHowToPlay: () => void;
  onLeave: () => void;
}

export default function LobbyActions({
  onSettings, onHowToPlay, onLeave,
}: LobbyActionsProps) {
  return (
    <div className={styles.actions}>
      <Button type="primary" onClick={onSettings}>Settings</Button>
      <Button type="primary" onClick={onHowToPlay}>How To Play</Button>
      <Button type="primary" onClick={onLeave}>Leave Lobby</Button>
    </div>
  );
}
