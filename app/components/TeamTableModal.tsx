import { Button, Modal, Tooltip } from "antd";
import { User } from "@/types/user";

interface ScriptProps {
  players: User[];
  isHost: boolean;
  onAssign: (playerId: string, team: "RED" | "BLUE" | "UNASSIGNED") => void;
  onMakeSpymaster: (playerId: string, role: "SPYMASTER" | "SPY") => void;
  assignTarget: User | null;
  setAssignTarget: (user: User | null) => void;
}

export default function TeamTable({ players, isHost, onAssign, onMakeSpymaster, assignTarget, setAssignTarget }: ScriptProps) {
  const bluePlayers = players.filter(p => p.team == "BLUE");
  const redPlayers = players.filter(p => p.team == "RED");

  // ensure teams are filled equally
  const maxPerTeam = Math.ceil(players.length / 2);
  const blueFull = bluePlayers.length >= maxPerTeam;
  const redFull = redPlayers.length >= maxPerTeam;

  return (
    <div style={{ display: "flex", gap: 40, alignItems: "flex-start", justifyContent: "space-between", width: "90vw" }}>

      {/*TEAM BLUE*/}
      <div style={{ width: "250px", background: "rgba(27,159,216,0.25)", borderRadius: 8, padding: 12 }}>
        <h3 style={{ color: "#1B9FD8", textAlign: "center" }}>Team Blue</h3>

        {/*loop over all blue players and create row for them*/}
        {bluePlayers.map(p => (
          <div key={p.id} style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6}}>
            <span style={{display: "flex", alignItems: "center", gap: 6, color: "#fff"}}>
              {p.role == "SPYMASTER" && (
                <span style={{fontSize: 16}}>🕵️</span>
              )} 
              
              {isHost && p.role !== "SPYMASTER" && (
                <Tooltip title="Click to make spymaster" color="#1B9FD8">
                  <span
                    style={{ fontSize: 16, opacity: 0.5, cursor: "pointer", transition: "opacity 0.2s" }}
                    onClick={() => {
                      if (p.id) onMakeSpymaster(p.id, "SPYMASTER");
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
                  >
                    🕵️
                  </span>
                </Tooltip>
              )}
              {p.username}
            </span>

            {isHost && (
              <Button
                size="small"
                style={{ borderColor: "#1B9FD8", color: "#1B9FD8" }}
                onClick={() => {
                  if (p.id)
                    onAssign(p.id, "UNASSIGNED");
                }}>
                Unassign
              </Button>
            )}
          </div>
        ))}
      </div>

      {/*TEAM RED*/}
      <div style={{ width: "250px", background: "rgba(232,64,28,0.25)", borderRadius: 8, padding: 12 }}>
        <h3 style={{ color: "#E8401C", textAlign: "center" }}>Team Red</h3>

        {/*loop over all red players and create row for them*/}
        {redPlayers.map(p => (
          <div key={p.id} style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6}}>
            <span style={{display: "flex", alignItems: "center", gap: 6, color: "#fff"}}>
              {p.role == "SPYMASTER" && (
                <span style={{fontSize: 16}}>🕵️</span>
              )}

              {isHost && p.role !== "SPYMASTER" && (
                <Tooltip title="Click to make spymaster" color="#E8401C">
                  <span
                    style={{ fontSize: 16, opacity: 0.5, cursor: "pointer", transition: "opacity 0.2s" }}
                    onClick={() => {
                      if (p.id) onMakeSpymaster(p.id, "SPYMASTER");
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
                  >
                    🕵️
                  </span>
                </Tooltip>
              )}
              {p.username}
            </span>
            
            {isHost && (
              <Button
                size="small"
                style={{ borderColor: "#E8401C", color: "#E8401C" }}
                onClick={() => {
                  if (p.id)
                    onAssign(p.id, "UNASSIGNED");
                }}>
                Unassign
              </Button>
            )}
          </div>
        ))}
      </div>

      {/*ASSIGN POP-UP*/}
      <Modal
        title={<div style={{ color: "#000" }}>Assign {assignTarget?.username} to a team</div>}
        open={assignTarget != null}
        onCancel={() => setAssignTarget(null)}
        footer={null}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "16px 0" }}>
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

    </div>
  );
}