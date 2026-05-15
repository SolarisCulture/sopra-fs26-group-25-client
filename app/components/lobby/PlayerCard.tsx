import { Button, Tooltip } from "antd";
import { User } from "@/types/user";
import styles from "@/styles/lobby/playerList.module.css";

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
  const canMakeHost = isHost && !player.isHost && !isMe;

  return (
    <div className={styles.playerCard}>
      <div className={styles.playerInfo}>
        <div className={styles.badges}>
          {isMe && (
            <span className={styles.youBadge}>You</span>
          )}
          {player.isHost && (
            <span className={styles.hostBadge}>Host</span>
          )}
        </div>
        <span className={styles.playerName}>{player.username}</span>
      </div>

      <div className={styles.playerActions}>
        {canMakeHost && (
          <Button
            size="small"
            type="primary"
            className={styles.makeHostButton}
            onClick={() => onTransferHost(player)}
          >
            Make host
          </Button>
        )}
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
