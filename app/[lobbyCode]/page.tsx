"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "@/styles/page.module.css";
import { Button, ConfigProvider, message, Modal, Table, TableProps } from "antd";
import { LobbySettings, DEFAULT_SETTINGS } from "@/types/lobby";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";

import HowToPlayModal from "../components/HowToPlayModal";
import LeaveModal from "../components/LeaveModal";
import UsernameModal from "../components/UsernameModal";
import SettingsModal from "../components/SettingsModal";
import TeamTable from "@/components/TeamTable";

export default function LobbyPage() {
  const apiService = useApi();
  const router = useRouter();
  const {lobbyCode} = useParams();

  // lobby info
  const [link, setLink] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [userID, setUserID] = useState<number | null>(null);

  // player list
  const [players, setPlayers] = useState<User[]>([]);
  const [assignTarget, setAssignTarget] = useState<User | null>(null);

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
      title: <span style={{color: "#fff", fontSize: "22px"}}>Players</span>,
      dataIndex: "username",
      key: "username",

      render: (username: string, player: User) => {
        return (
          <span style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <span style={{display: "flex", alignItems: "center", gap: 4}}>
              <span style={{width: 20, display: "inline-block", textAlign: "center", position: "relative", top: -2}}>
                {player.isHost ? "👑" : ""}
              </span>
              {username}
            </span>
            {/* only allow host to assign players to teams*/}
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

  // on page load fetch players
  useEffect(() => {
    if (userID == null) return;
    const fetchPlayers = async () => {
      try {
        const data = await apiService.get<User[]>(`/lobbies/${lobbyCode}/players`);
        setPlayers(data);
      } catch {
        message.error("Failed to fetch players!");
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 3000);
    return () => clearInterval(interval);
  }, [apiService, lobbyCode, userID]);

  // check on page load if user already joined this lobby (show pop-up otherwise)
  useEffect(() => {
    setIsHost(true);
    setLink(`${window.location.origin}/${lobbyCode}`);
    
    // has this browser already joined this lobby?
    const savedId = localStorage.getItem(`playerId_${lobbyCode}`);

    if (savedId){
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
      localStorage.setItem(`playerID_${lobbyCode}`, String(newPlayerID));
      const createdThisLobby = localStorage.getItem("hostedLobby") == lobbyCode;
      
      if (createdThisLobby) {
        localStorage.setItem(`isHost_${lobbyCode}`, "true");
        localStorage.removeItem("hostedLobby") // not needed anymore
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
        setPlayers(players.map(p => p.id == playerId ? { ...p, team } : p));
      } catch {
        message.error("Failed to assign team!");
      }
    })();
  };

  // leave lobby
  const handleLeave = async () => {
    if (userID == null) return;
    try {
      await apiService.delete(`/lobbies/${lobbyCode}/players/${userID}`);
      if (isHost && players.length > 1) {
        const nextHost = players.find(p => p.id != String(userID));
        if (nextHost) {
          await apiService.put(`/api/lobbies/${lobbyCode}/host/transfer`, {
            currentHostId: userID,
            newHostId: nextHost.id,
          });
        }
      }

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
          Table: {colorText: "#fff", colorBgContainer: "rgba(255, 255, 255, 0.2)"}
        },
      }}>

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

        {/*TEAM TABLE*/}
        <TeamTable
          players={players}
          isHost={isHost}
          onAssign={handleAssignTeam}
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
    </ConfigProvider>
  );
}