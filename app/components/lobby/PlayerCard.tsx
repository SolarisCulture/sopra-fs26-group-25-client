import { Button, Tooltip } from "antd";
import { User } from "@/types/user";
import styles from "@/styles/playerList.module.css";

interface PlayerCardProps {
  player: User;
  isHost: boolean;
  onAssign: (player: User) => void;
  onTransferHost: (player: User) => void;
}

export default function PlayerCard({
  player, isHost, onAssign, onTransferHost,
}: PlayerCardProps) {
  return (
    <div className={styles.playerCard}>
      <div className={styles.playerInfo}>
        <span className={styles.crownSlot}>
          {player.isHost ? "👑" : isHost && (
            <Tooltip title="Make host" color="#7B2D8B">
              <span
                className={styles.crownHover}
                onClick={() => onTransferHost(player)}
              >
                👑
              </span>
            </Tooltip>
          )}
        </span>
        <span className={styles.playerName}>{player.username}</span>
      </div>

      {isHost && (!player.team || player.team === "UNASSIGNED") && (
        <Button size="small" type="primary" onClick={() => onAssign(player)}>
          Assign
        </Button>
      )}
    </div>
  );
}