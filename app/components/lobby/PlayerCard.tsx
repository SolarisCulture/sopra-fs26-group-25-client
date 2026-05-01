import { Button, Tooltip } from "antd";
import { User } from "@/types/user";
import styles from "@/styles/playerList.module.css";

interface PlayerCardProps {
  player: User;
  isHost: boolean;
  currentUserID: number | null;
  onAssign: (player: User) => void;
  onTransferHost: (player: User) => void;
  onKick: (player: User) => void;
}

export default function PlayerCard({
  player, isHost, currentUserID, onAssign, onTransferHost, onKick,
}: PlayerCardProps) {
  const isMe = Number(player.id) === Number(currentUserID);

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

      <div className={styles.playerActions}>
        {(isHost || isMe) && (!player.team || player.team === "UNASSIGNED") && (
          <Button size="small" type="primary" onClick={() => onAssign(player)}>
            Assign
          </Button>
        )}
        {isHost && !isMe && (
          <Tooltip title="Kick player" color="#7B2D8B">
            <Button size="small" type="primary" onClick={() => onKick(player)}>
              X
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
