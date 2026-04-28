import { Button } from "antd";
import styles from "@/styles/lobby.module.css";

interface LobbyHeaderProps {
  lobbyCode: string;
  link: string;
  onCopy: () => void;
}

export default function LobbyHeader({
  lobbyCode, link, onCopy,
}: LobbyHeaderProps) {
  return (
    <header className={styles.header}>
      <span className={styles.codeBadge}>
        Lobby Code: {lobbyCode}
      </span>
      <span className={styles.linkBadge}>
        <span className={styles.linkText}>{link}</span>
        
        <Button type="primary" size="small" onClick={onCopy}>
          Copy
        </Button>
      </span>
    </header>
  );
}