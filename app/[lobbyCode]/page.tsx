"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "@/styles/page.module.css";
import { App, Button, ConfigProvider, message, Modal, Table, TableProps, Tooltip } from "antd";
import { Lobby, LobbySettings, DEFAULT_SETTINGS } from "@/types/lobby";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";

// websocket
import { createLobbySocket, LobbyEvent } from "@/utils/lobbyWebsocket";

import HowToPlayModal from "../components/HowToPlayModal";
import LeaveModal from "../components/LeaveModal";
import UsernameModal from "../components/UsernameModal";
import SettingsModal from "../components/SettingsModal";
import TeamTableModal from "@/components/TeamTableModal";

export default function LobbyPage() {
  const { message } = App.useApp();
  const apiService = useApi();
  const router = useRouter();
  const { lobbyCode } = useParams();

  // lobby info
  const [link, setLink] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [userID, setUserID] = useState<number | null>(null);
  const [lobby, setLobby] = useState<Lobby | null>(null);

  // player list
  const [players, setPlayers] = useState<User[]>([]);
  const [assignTarget, setAssignTarget] = useState<User | null>(null);
  const allAssigned =
    players.length > 0
    && players.every(p => p.team !== null)
    && players.filter(p => p.team == "blue").some(p => p.role == "spymaster")
    && players.filter(p => p.team == "red").some(p => p.role == "spymaster");

  // username pop-up
  const [showUsernamePopUp, setShowUsernamePopUp] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [joiningLobby, setJoiningLobby] = useState(false);

  // other pop-ups
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  // settings
  const [settings, setSettings] = useState<LobbySettings>(DEFAULT_SETTINGS);
  const [spymasterTimerDisabled, setSpymasterTimerDisabled] = useState(false);
  const [spyTimerDisabled, setSpyTimerDisabled] = useState(true);
  const [spymasterTimerDraft, setSpymasterTimerDraft] = useState<number | null>(DEFAULT_SETTINGS.spymasterTimer);
  const [spyTimerDraft, setSpyTimerDraft] = useState<number | null>(null);
  const [roundsNumberDisabled, setRoundsNumberDisabled] = useState(true);

  // player table
  const playerColumns: TableProps<User>["columns"] = [
    {
      title: <span style={{ color: "#fff", fontSize: "22px" }}>Players</span>,
      dataIndex: "username",
      key: "username",

      render: (username: string, player: User) => {
        return (
          <span style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <span style={{display: "flex", alignItems: "center", gap: 4}}>
              <span style={{width: 20, display: "inline-block", textAlign: "center", position: "relative", top: -2}}>
                {player.isHost ? "👑" : isHost && player.id !== String(userID) ? (
                  <Tooltip title="Click to make host" color="#7B2D8B">
                    <span
                      style={{cursor: "pointer", fontSize: "16px", opacity: 0.5, transition: "opacity 0.2s"}}
                      onClick={() => handleTransferHost(player)}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
                    >
                      👑
                    </span>
                  </Tooltip>
                ) : ""}
              </span>
              {username}
            </span>

            {/* only allow host to assign players to teams and transfer host role*/}
            {isHost && !player.team && (
              <Button
                size="small"
                type="primary"
                onClick={() => setAssignTarget(player)}
              >
                Assign
              </Button>
            )}
          </span>
        );
      },
    },
  ];

  // fetch players as a helper function
  const fetchPlayers = async () => {
    try {
      const data = await apiService.get<User[]>(`/api/lobbies/${lobbyCode}/players`);
      const data = await apiService.get<User[]>(`/api/lobbies/${lobbyCode}/players`);
      setPlayers(data);
    } catch (error) {
      message.error("Failed to fetch players!");
    }
  };

  // fetch lobby as a helper function
  const fetchLobby = async () => {
    try {
      const lobbyData = await apiService.get<Lobby>(`/api/lobbies/${lobbyCode}`);
      setLobby(lobbyData);

      if (lobbyData.lobbyStatus === "IN_PROGRESS") {
        router.push(`/${lobbyCode}/game`);
      }
    } catch (error) {
      message.error("Failed to fetch lobby data!");
    }
  };


  // fetch player and lobby on startupt
  useEffect(() => {
    if (!userID) return;
    fetchPlayers();
    fetchLobby();
  }, [apiService, lobbyCode, userID]);


  // websocket
  useEffect(() => {
    if(!lobbyCode || !userID) return;
    if (!lobbyCode) return;
    const socket = createLobbySocket(String(lobbyCode), async (event: LobbyEvent) => {
      console.log("Lobby event received:", event);

      switch (event.type) {
        case "PLAYER_JOINED":
        case "PLAYER_LEFT": { await fetchPlayers(); break; }
        case "HOST_CHANGED":
        case "TEAM_UPDATED":
        case "ROLE_UPDATED": { await fetchPlayers(); await fetchLobby(); break; }
        case "STATUS_UPDATED": {
          await fetchLobby();
          break;
        }

        default:
          break;
      }
    });

    socket.connect();
    return () => {
      socket.disconnect();
    }
  }, [lobbyCode, userID, router]);

  // check on page load if user already joined this lobby (show pop-up otherwise)
  useEffect(() => {
    setLink(`${window.location.origin}/${lobbyCode}`);

    // has this browser already joined this lobby?
    const savedId = localStorage.getItem(`playerId_${lobbyCode}`);

    if (savedId) {
      setUserID(Number(savedId));
      setIsHost(localStorage.getItem("hostedLobby") == lobbyCode);
    } else {
      setShowUsernamePopUp(true);
    }
  }, [lobbyCode]); // use effect only runs again if lobbyCode changes --> won't actually happen

  // join lobby with username
  const handleJoin = async () => {
    const username = usernameInput.trim();

    if (username.length < 1 || username.length > 50) {
      setUsernameError("Username must be between 1 and 50 characters.");
      return;
    }

    if (String(lobbyCode) == "new") {
      setJoiningLobby(true);
      try {
        const lobby = await apiService.post<Lobby>("/api/lobbies", { hostUsername: username });
        localStorage.setItem("hostedLobby", lobby.lobbyCode);
        localStorage.setItem(`playerId_${lobby.lobbyCode}`, String(lobby.hostId));
        router.push(`/${lobby.lobbyCode}`);
      } catch {
        setUsernameError("Failed to create lobby. Please try again.");
      } finally {
        setJoiningLobby(false);
      }
      return;
    }

    // make sure username is unique
    const alreadyTaken = players.some(p => p.username?.toLowerCase() == username.toLowerCase());
    if (alreadyTaken) {
      setUsernameError("This username is already taken. Please choose a different username.");
      return;
    }

    setJoiningLobby(true);
    setUsernameError("");

    try {
      const newPlayerID = await apiService.post<number>(`/api/lobbies/${lobbyCode}/join`, username);
      localStorage.setItem(`playerId_${lobbyCode}`, String(newPlayerID));
      const createdThisLobby = localStorage.getItem("hostedLobby") == lobbyCode;

      if (createdThisLobby) {
        localStorage.setItem(`isHost_${lobbyCode}`, "true");
        localStorage.removeItem("hostedLobby"); // not needed anymore
        setIsHost(true);
      }

      setUserID(newPlayerID);
      setShowUsernamePopUp(false);
    } catch {
      setUsernameError("There was an issue while joining. Username is already taken or the lobby may no longer exist.");
    } finally {
      setJoiningLobby(false);
    }
  };

  // assign players to teams (blue or red)
  const handleAssignTeam = (playerId: string | null, team: "red" | "blue" | null): void => {
    if (playerId == null) return;

    (async () => {
      try {
        await apiService.put(`/api/lobbies/${lobbyCode}/player/${playerId}/team`, { team });

        if (team !== null) {
          const alreadyOnTeam = players.filter(p => p.team == team);
          const role = alreadyOnTeam.length == 0 ? "spymaster" : "spy";
          await apiService.put(`/api/lobbies/${lobbyCode}/player/${playerId}/role`, { role });
        }
        await fetchPlayers();
      } catch {
        message.error("Failed to assign team!");
      }
    })();
  };

  // handle assign role
  const handleAssignRole = async (playerId: string) => {
    const player = players.find(p => p.id == playerId);
    if (!player?.team) return;

    try {

      const currentSpymaster = players.find(p => p.team == player.team && p.role == "spymaster");
      if (currentSpymaster?.id) {
        await apiService.put(`/api/lobbies/${lobbyCode}/player/${currentSpymaster.id}/role`, {role: "spy"});
      }

      await apiService.put(`/api/lobbies/${lobbyCode}/player/${playerId}/role`, {role: "spymaster"});
      await fetchPlayers();
    } catch {
      message.error("Failed to assign role!");
    }
  };

  // handle transfer host
  const handleTransferHost = async (newHost: User) => {
    if (userID == null) return;
    try {
      await apiService.put(`/api/lobbies/${lobbyCode}/host/transfer`, {
        currentHostId: userID,
        newHostId: newHost.id,
      });
      message.success(`${newHost.username} is now the host.`);
    } catch {
      message.error("Failed to transfer host!");
    }
  };

  // leave lobby
  const handleLeave = async () => {
    if (userID == null) return;
    try {
      await apiService.delete(`/api/lobbies/${lobbyCode}/players/${userID}`);
      localStorage.removeItem(`playerId_${lobbyCode}`);
      localStorage.removeItem(`isHost_${lobbyCode}`);
      router.push("/");
    } catch {
      message.error("Failed to leave lobby!");
    }
  };

  // save settings 
  const handleSave = async () => {
    try {
      await apiService.put(`/api/lobbies/${lobbyCode}`, settings);
      message.success("Settings saved!");
    } catch {
      message.error("Failed to save settings!");
    }
  };

  // reset settings
  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSpyTimerDisabled(true);
    setSpymasterTimerDisabled(false);
    setRoundsNumberDisabled(true);
    message.info("Reset to default.");
  };

  const handleSpymasterTimerDisabledChange = (checked: boolean) => {
    setSpymasterTimerDisabled(checked);
    setSettings({ ...settings, spymasterTimer: checked ? null : DEFAULT_SETTINGS.spymasterTimer });
  };

  const handleSpyTimerDisabledChange = (checked: boolean) => {
    setSpyTimerDisabled(checked);
    setSettings({ ...settings, spyTimer: checked ? null : DEFAULT_SETTINGS.spyTimer });
  };

  const handleRoundsNumberChange = (val: number | null) => {
    if (val == null) return;
    if (val < 1) {
      message.warning("Rounds must be at least 1.");
      return;
    }
    if (val > 100) {
      message.warning("Rounds cannot exceed 100.");
      return;
    }
    setSettings({ ...settings, roundsNumber: val });
  };

  // helper for timer restrictions
  const validateAndCommitTimer = (
    val: number | null,
    label: string,
    onCommit: (v: number) => void
  ) => {
    if (val == null) return;
    if (val < 10) {
      message.warning(`${label} cannot be less than 10 seconds.`);
      return;
    }
    if (val > 3600) {
      message.warning(`${label} cannot exceed 3600 seconds.`);
      return;
    }
    onCommit(val);
  };

  // clean up roundsNumberDisabled
  const handleRoundsLimitDisabledChange = (checked: boolean) => {
    setRoundsNumberDisabled(checked);
    setSettings({ ...settings, roundsNumber: checked ? null : DEFAULT_SETTINGS.roundsNumber });
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Select: {colorText: "#000", colorBgContainer: "#fff"},
          Input: {colorText: "#000", colorBgContainer: "#fff"},
          InputNumber: {colorText: "#000", colorBgContainer: "#fff"},
          Modal: {colorText: "#000", colorBgContainer: "#fff"},
          Checkbox: {colorText: "#000", colorBgContainer: "#fff"},
          Table: {colorText: "#fff", colorBgContainer: "rgba(250, 250, 250, 0.25)"}
        },
      }}>

      <App>

        <div className={styles.page}>

          {/*INPUT USERNAME POP-UP*/}
          <Modal
            title={<div style={{color: "#000", textAlign: "center"}}>Enter Username</div>}
            open={showUsernamePopUp}
            closable={false}
            maskClosable={false}
            footer={null}
          >
            <UsernameModal
              open={showUsernamePopUp}
              usernameInput={usernameInput}
              usernameError={usernameError}
              joiningLobby={joiningLobby}
              onChange={(val: string) => { setUsernameInput(val); setUsernameError(""); }}
              onJoin={handleJoin}
            />
          </Modal>

          <div>
            <h1 style={{marginTop: "50px", fontSize: "48px", fontWeight: "700", color: "#fff"}}>Lobby</h1>
          </div>


          {/*LINK & CODE*/}
          <div style={{position: "absolute", top: 20, right: 20, display: "flex", alignItems: "center", gap: "10px", background: "rgba(255, 255, 255, 0.2)", padding: "10px 14px", borderRadius: "8px"}}>
            <span style={{fontWeight: 600, color: "#fff"}}>{link}</span>
            <Button
              type="primary"
              onClick={() => {
                navigator.clipboard.writeText(link);
                message.success("Copied!");
              }}
            >
              Copy
            </Button>
          </div>

          <div style={{position: "absolute", top: 20, left: 20, display: "flex", alignItems: "center", gap: "10px", background: "rgba(255, 255, 255, 0.2)", padding: "10px 14px", borderRadius: "8px"}}>
            <span style={{fontWeight: 600, color: "#fff"}}>Lobby Code: {lobbyCode}</span>
          </div>


          {/*PLAYER TABLE*/}
          <div style={{position: "absolute", display: "flex", flexDirection: "column", gap: "10px", width: "350px"}}>
            {players && (
              <Table<User>
                columns={playerColumns}
                dataSource={players}
                rowKey="id"
                pagination={false}
                style={{borderRadius: "8px", overflow: "hidden"}}
              />
            )}
          </div>

          {/*START GAME*/}
          <div style={{position: "absolute", bottom: 45, left: "50%", transform: "translateX(-50%)"}}>
          <Button
            type="primary"
            style={{
              width: "200px",
              height: "50px",
              fontSize: "18px",
              fontWeight: "600",
              background: "#7B2D8B",
              borderColor: "#7B2D8B",
              opacity: allAssigned && isHost ? 1 : 0.4,
            }}
            disabled={!allAssigned || !isHost}
            onClick={() => router.push(`/${lobbyCode}/game`)}
          >
            Start Game
          </Button>
          </div>

          {/*TEAM TABLE*/}
          <TeamTableModal
            players={players}
            isHost={isHost}
            onAssign={handleAssignTeam}
            onMakeSpymaster={handleAssignRole}
            assignTarget={assignTarget}
            setAssignTarget={setAssignTarget}
          />


          {/*HOW TO PLAY*/}
          <div style={{position: "absolute", bottom: 75, right: 20, display: "flex", alignItems: "center"}}>
            <Button
              type="primary"
              style={{width: "125px"}}
              onClick={() => setHowToPlayOpen(true)}>
              How To Play
            </Button>
          </div>
          <HowToPlayModal
            open={howToPlayOpen}
            onClose={() => setHowToPlayOpen(false)}
          />

          {/*LEAVE LOBBY*/}
          <div style={{position: "absolute", bottom: 20, right: 20, display: "flex", alignItems: "center"}}>
            <Button
              type="primary"
              style={{width: "125px"}}
              onClick={() => setLeaveOpen(true)}
            >
              Leave Lobby
            </Button>
          </div>
          <LeaveModal
            open={leaveOpen}
            onStay={() => setLeaveOpen(false)}
            onLeave={handleLeave}
          />

          {/*SETTINGS*/}
          <Button
            type="primary"
            onClick={() => setSettingsOpen(true)}
            style={{position: "absolute", bottom: 130, right: 20, display: "flex", alignItems: "center", width: "125px"}}
          >
            Settings
          </Button>
          <SettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            isHost={isHost}
            settings={settings}
            setSettings={setSettings}
            spymasterTimerDisabled={spymasterTimerDisabled}
            spyTimerDisabled={spyTimerDisabled}
            spymasterTimerDraft={spymasterTimerDraft}
            spyTimerDraft={spyTimerDraft}
            setSpymasterTimerDraft={setSpymasterTimerDraft}
            setSpyTimerDraft={setSpyTimerDraft}
            roundsNumberDisabled={roundsNumberDisabled}
            onSpymasterTimerDisabledChange={handleSpymasterTimerDisabledChange}
            onSpyTimerDisabledChange={handleSpyTimerDisabledChange}
            onRoundsLimitDisabledChange={handleRoundsLimitDisabledChange}
            onRoundsNumberChange={handleRoundsNumberChange}
            validateAndCommitTimer={validateAndCommitTimer}
            onReset={handleReset}
            onSave={handleSave}
          />
        </div>
      </App>
    </ConfigProvider>
  );
}
