import { Button, Modal, Tooltip } from "antd";
import { User } from "@/types/user";
import styles from "@/styles/lobby/teamTable.module.css";

interface ScriptProps {
  players: User[];
  isHost: boolean;
  currentUserID: number | null;
  onAssign: (playerId: string, team: "RED" | "BLUE" | "UNASSIGNED") => void;
  onMakeSpymaster: (playerId: string, role: "SPYMASTER" | "SPY") => void;
  assignTarget: User | null;
  setAssignTarget: (user: User | null) => void;
}

export default function TeamTable({
  players, isHost, currentUserID, onAssign, onMakeSpymaster, assignTarget, setAssignTarget,
}: ScriptProps) {
  const bluePlayers = players.filter(p => p.team == "BLUE");
  const redPlayers = players.filter(p => p.team == "RED");

  const maxPerTeam = Math.ceil(players.length / 2);
  const blueFull = bluePlayers.length >= maxPerTeam;
  const redFull = redPlayers.length >= maxPerTeam;

  const renderPlayer = (p: User, teamColor: string) => (
    <div key={p.id} className={styles.playerRow}>
      <span className={styles.playerInfo}>
        <span className={styles.roleSlot}>
          {p.role == "SPYMASTER" && (
            <span className={styles.spyIcon}>🕵️</span>
          )}
          {isHost && p.role !== "SPYMASTER" && (
            <Tooltip title="Click to make spymaster" color={teamColor}>
              <span
                className={styles.spyIconHover}
                onClick={() => { if (p.id) onMakeSpymaster(p.id, "SPYMASTER"); }}
              >🕵️</span>
            </Tooltip>
          )}
        </span>
        <span className={styles.playerName}>{p.username}</span>
      </span>

      {(isHost || String(p.id) === String(currentUserID)) && (
        <Button
          size="small"
          style={{ borderColor: teamColor, color: teamColor }}
          onClick={() => { if (p.id) onAssign(p.id, "UNASSIGNED"); }}
        >
          Unassign
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* TEAM BLUE */}
      <div className={`${styles.teamBox} ${styles.blueTeamBox}`} style={{ background: "rgba(27,159,216,0.25)" }}>
        <h3 className={styles.teamTitle} style={{ color: "white" }}>Team Blue</h3>
        <div className={styles.playerList}>
          {bluePlayers.map(p => renderPlayer(p, "#1B9FD8"))}
        </div>
      </div>

      {/* TEAM RED */}
      <div className={`${styles.teamBox} ${styles.redTeamBox}`} style={{ background: "rgba(232,64,28,0.25)" }}>
        <h3 className={styles.teamTitle} style={{ color: "white" }}>Team Red</h3>
        <div className={styles.playerList}>
          {redPlayers.map(p => renderPlayer(p, "#E8401C"))}
        </div>
      </div>

      {/* ASSIGN POP-UP */}
      <Modal
        title={<div style={{ color: "#000" }}>Assign {assignTarget?.username} to a team</div>}
        open={assignTarget != null}
        onCancel={() => setAssignTarget(null)}
        footer={null}
      >
        <div className={styles.assignButtons}>
          <Button
            type="primary"
            style={{ background: "#1B9FD8", borderColor: "#1B9FD8", opacity: blueFull ? 0.4 : 1 }}
            disabled={blueFull}
            onClick={() => {
              if (assignTarget?.id) {
                onAssign(assignTarget.id, "BLUE");
                setAssignTarget(null);
              }
            }}
          >
            Team Blue
          </Button>
          <Button
            type="primary"
            style={{ background: "#E8401C", borderColor: "#E8401C", opacity: redFull ? 0.4 : 1 }}
            disabled={redFull}
            onClick={() => {
              if (assignTarget?.id) {
                onAssign(assignTarget.id, "RED");
                setAssignTarget(null);
              }
            }}
          >
            Team Red
          </Button>
        </div>
      </Modal>
    </>
  );
}
