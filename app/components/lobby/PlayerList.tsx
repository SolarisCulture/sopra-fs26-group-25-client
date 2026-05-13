// components/lobby/PlayerList.tsx
import { Table, Button, Tooltip } from "antd";
import type { TableProps } from "antd";
import { User } from "@/types/user";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import PlayerCard from "./PlayerCard";
import styles from "@/styles/lobby/playerList.module.css";

interface PlayerListProps {
  players: User[];
  isHost: boolean;
  currentUserID: number | null;
  onAssign: (player: User) => void;
  onTransferHost: (player: User) => void;
  onKick: (player: User) => void;
}

export default function PlayerList({
  players, isHost, currentUserID, onAssign, onTransferHost, onKick,
}: PlayerListProps) {
  const isMobile = useMediaQuery("(max-width: 600px)");

  const columns: TableProps<User>["columns"] = [
    {
      title: <div style={{ color: "#fff", fontSize: "22px", textAlign: "center", width: "100%" }}>Players</div>,
      dataIndex: "username",
      key: "username",
      render: (username: string, player: User) => {
  const isMe = Number(player.id) === Number(currentUserID);
  const canMakeHost = isHost && !player.isHost && !isMe;

  return (
    <span className={styles.playerRow}>
      <span className={styles.playerInfo}>
        <div className={styles.badges}>
          {isMe && (
            <span className={styles.youBadge}>You</span>
          )}
          {player.isHost && (
            <span className={styles.hostBadge}>Host</span>
          )}
        </div>
        <span className={styles.playerName}>{username}</span>


      </span>

      <span className={styles.playerActions}>
        {canMakeHost && (
          <Button
            size="small"
            type="primary"
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

        <span className={styles.kickSlot}>
          {isHost && !isMe && (
            <Tooltip title="Click to kick player" color="#7B2D8B">
              <button
                type="button"
                className={styles.kickButton}
                onClick={() => onKick(player)}
              >
                X
              </button>
            </Tooltip>
          )}
        </span>
      </span>
    </span>
  );
},
    },
  ];

  if (isMobile) {
    return (
      <div className={styles.cardList}>
        {players.map((p) => (
          <PlayerCard
            key={p.id}
            player={p}
            isHost={isHost}
            currentUserID={currentUserID}
            onAssign={onAssign}
            onTransferHost={onTransferHost}
            onKick={onKick}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <Table<User>
        columns={columns}
        dataSource={players}
        rowKey="id"
        pagination={false}
        scroll={{ y: 350 }}
      />
    </div>
  );
}
