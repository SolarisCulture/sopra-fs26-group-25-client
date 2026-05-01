// components/lobby/PlayerList.tsx
import { Table, Button, Tooltip } from "antd";
import type { TableProps } from "antd";
import { User } from "@/types/user";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import PlayerCard from "./PlayerCard";
import styles from "@/styles/playerList.module.css";

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
      title: <span style={{ color: "#fff", fontSize: "22px" }}>Players</span>,
      dataIndex: "username",
      key: "username",
      render: (username: string, player: User) => {
        const isMe = Number(player.id) === Number(currentUserID);
        return (
          <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 20, display: "inline-block", textAlign: "center" }}>
                {player.isHost ? "👑" : isHost && (
                  <Tooltip title="Click to make host" color="#7B2D8B">
                    <span
                      style={{ cursor: "pointer", fontSize: "16px", opacity: 0.5 }}
                      onClick={() => onTransferHost(player)}
                    >👑</span>
                  </Tooltip>
                )}
              </span>
              <span style={{ wordBreak: "break-all" }}>{username}</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {(isHost || isMe) && (!player.team || player.team === "UNASSIGNED") && (
                <Button size="small" type="primary" onClick={() => onAssign(player)}>
                  Assign
                </Button>
              )}
              <span style={{ width: 24, display: "flex", justifyContent: "center" }}>
                {isHost && !isMe && (
                  <Tooltip title="Click to kick player" color="#7B2D8B">
                    <span
                      style={{ cursor: "pointer", fontSize: "16px", opacity: 0.5 }}
                      onClick={() => onKick(player)}
                    >
                      X
                    </span>
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
        scroll={{ y: 450 }}
      />
    </div>
  );
}
