"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "@/styles/page.module.css";
import { Button, Checkbox, ConfigProvider, Input, InputNumber, message, Modal, Select, Table, TableProps, Upload } from "antd";
import { Lobby, LobbySettings, DEFAULT_SETTINGS } from "@/types/lobby";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { fetchInternalImage } from "next/dist/server/image-optimizer";

// websocket
import { createLobbySocket, LobbyEvent } from "@/utils/lobbyWebsocket";

export default function LobbyPage() {
  const apiService = useApi();
  const router = useRouter();
  const {lobbyCode} = useParams();
  const [link, setLink] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [settings, setSettings] = useState<LobbySettings>(DEFAULT_SETTINGS);
  const [timerDisabled, setTimerDisabled] = useState(false);
  const [roundsNumberDisabled, setRoundsNumberDisabled] = useState(true);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [players, setPlayers] = useState<User[] | null>(null);
  const [userID, setUserID] = useState("");
  const [lobby, setLobby] = useState<Lobby | null>(null);

  // mock players to see table
 // const [players, setPlayers] = useState<User[] | null>([
 //   {id: "1", username: "alice123", token: null},
 //   {id: "2", username: "bob456", token: null},
 // ]);

const playerColumns: TableProps<User>["columns"] = [
  {
    title: <span style={{color: "#fff", fontSize: "22px"}}>Players</span>,
    dataIndex: "username",
    key: "username",
    render: (username: string, player: User) => {
      const isCurrentHost = isHost && player.id == userID;
      return (<span>{username} {isCurrentHost && "👑"}</span>);
    },
  },
];

// link & host & id useEffect
useEffect(() => {
  setLink(`${window.location.origin}/lobby/${lobbyCode}`);
  setIsHost(localStorage.getItem("hostedLobby") == lobbyCode);
  setUserID(JSON.parse(localStorage.getItem("userID") || '""'));
}, [lobbyCode]); // use effect only runs again if lobbyCode changes --> won't actually happen

// fetch players as a helper function
const fetchPlayers = async () => {
  try {
    const data = await apiService.get<User[]>(`/lobbies/${lobbyCode}/players`);
    setPlayers(data);
  } catch (error) {
    message.error("Failed to fetch players!");
  }
};

// fetch lobby as a helper function
const fetchLobby = async () => {
  try {
    const lobbyData = await apiService.get<Lobby>(`/lobbies/${lobbyCode}`);
    setLobby(lobbyData);

    if (lobbyData.lobbyStatus === "IN_PROGRESS") {
      router.push(`/game/${lobbyCode}`);
    }
  } catch (error) {
    message.error("Failed to fetch lobby data!");
  }
};

// fetch player and lobby on startupt
useEffect(() => {
  fetchPlayers();
  fetchLobby();

  // using websocket events, not needed to fetch every 3 secs
  // const interval = setInterval(fetchPlayers, 3000);
  // return () => clearInterval(interval);
}, [apiService, lobbyCode, router]);


// websocket
useEffect(() => {
  if(!lobbyCode) return;
  const socket = createLobbySocket(String(lobbyCode), async (event: LobbyEvent) => {
  console.log("Lobby event received:", event);
  
  switch (event.type) {
    case "PLAYER_JOINED": {fetchPlayers(); break;}
    case "PLAYER_LEFT": {fetchPlayers(); break;}
    case "HOST_CHANGED": {fetchPlayers(); fetchLobby(); break;}
    case "TEAM_UPDATED": {fetchPlayers(); fetchLobby(); break;}
    case "ROLE_UPDATED": {fetchPlayers(); fetchLobby(); break;}
    case "STATUS_UPDATED": {
      const updatedLobby = event.data as Lobby;
      setLobby(updatedLobby);

      if (updatedLobby.lobbyStatus === "IN_PROGRESS") {
        router.push(`/game/${lobbyCode}`);
      }
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
}, [apiService, lobbyCode, router]);


const handleLeave = async () => {
  try {
    await apiService.delete(`/lobbies/${lobbyCode}/players/${userID}`);
    if (isHost) {
      await apiService.put(`/lobbies/${lobbyCode}/host`, {});
      localStorage.removeItem("hostedLobby");
    }
    router.push("/");
  } catch (error) {
    message.error("Failed to leave lobby!");
  }
};

const handleSave = async () => {
  try {
    await apiService.put(`/api/lobbies/${lobbyCode}`, settings);
    message.success("Settings saved!");
  } catch (error) {
    message.error("Failed to save settings!");
  }
};

const handleReset = () => {
  setSettings(DEFAULT_SETTINGS);
  setTimerDisabled(false);
  setRoundsNumberDisabled(true);
  message.info("Reset to default.");
};

const handleTimerChange = (val: number | null) => {
  if (val == null) return;
  if (val < 10) {
    message.warning("Timer cannot be less than 10 seconds.");
    return;
  }
  if (val > 300) {
    message.warning("Timer cannot exceed 300 seconds.");
    return;
  }
  setSettings({ ...settings, roundTimer: val });
};

// clean up timerDisabled
const handleTimerDisabledChange = (checked: boolean) => {
  setTimerDisabled(checked);
  setSettings({ ...settings, roundTimer: checked ? null : DEFAULT_SETTINGS.roundTimer });
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

// clean up roundsNumberDisabled
const handleRoundsLimitDisabledChange = (checked: boolean) => {
  setRoundsNumberDisabled(checked);
  setSettings({ ...settings, roundsNumber: checked ? null : DEFAULT_SETTINGS.roundsNumber });
};

// clean up customTheme & customWordList
const handleThemeChange = (val: string) => {
  setSettings({ ...settings, theme: val, customTheme: "", customWordList: "" });
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
        <div>
          <h1 style={{marginTop: "50px", fontSize: "48px", fontWeight: "700"}}>Lobby</h1>
        </div>


        {/*LINK & CODE*/}
        <div style={{position: "absolute", top: 20, right: 20, display: "flex", alignItems: "center", gap: "10px", background: "rgba(255, 255, 255, 0.2)", padding: "10px 14px", borderRadius: "8px"}}>
          <span style={{fontWeight: 600}}>{link}</span>
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
          <span style={{fontWeight: 600}}>Code: {lobbyCode}</span>
        </div>


        {/*PLAYER TABLE*/}
        <div style={{position: "absolute", display: "flex", flexDirection: "column", gap: "10px", width: "200px"}}>
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


        {/*HOW TO PLAY*/}
        <div style={{position: "absolute", bottom: 75, right: 20, display: "flex", alignItems: "center"}}>
          <Button 
            type="primary"
            style={{width: "125px"}}
            onClick={() => {setHowToPlayOpen(true)}}
          >
            How To Play
          </Button>
          <Modal
            title={<div style={{color: "#000"}}>Game Rules</div>}
            open={howToPlayOpen}
            onCancel={() => setHowToPlayOpen(false)}
            footer={null}
          >
            <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
          </Modal>
        </div>

        {/*LEAVE LOBBY*/}
        <div style={{position: "absolute", bottom: 20, right: 20, display: "flex", alignItems: "center"}}>
          <Button 
            type="primary"
            style={{width: "125px"}}
            onClick={() => setLeaveOpen(true)}
          >
            Leave Lobby
          </Button>
          <Modal
            title={<div style={{color: "#000"}}>Are you sure you want to leave the lobby?</div>}
            open={leaveOpen}
            closable={false}
            footer={null}
          >
            <p>By leaving the lobby you return to the home page.</p>
            <div style={{display: "flex", justifyContent: "right", gap: 10, marginTop: "10px"}}>
              <Button onClick={() => setLeaveOpen(false)}>No, stay.</Button>
              <Button type="primary" onClick={handleLeave}>Yes, leave.</Button>
            </div>
          </Modal>
        </div>

        {/*SETTINGS*/}
        <Button 
          type="primary"
          onClick={() => {setSettingsOpen(true)}}
          style={{position: "absolute", bottom: 130, right: 20, display: "flex", alignItems: "center", width: "125px"}}
        >
          Settings
        </Button>

        <Modal
          title={<div style={{color: "#000", textAlign: "center"}}>Settings</div>}
          width={"400px"}
          open={settingsOpen}
          onCancel={() => setSettingsOpen(false)}
          footer={null}
        >


          {/*THEME*/}
          <div className={styles.ctas} style={{ display: "flex", flexDirection: "column", width: 200, margin: "auto"}}>
            <label>Select a theme:</label>
            <Select
              style={{width: 200}}
              value={settings.theme}
              disabled={!isHost}
              onChange={handleThemeChange}
              options={[
                {value: "", label: "Select..."},
                {value: "standard", label: "Standard"},
                {value: "customTheme", label: "Custom Theme"},
                {value: "customWordList", label: "Custom Word List"},
              ]}
            />


            {/*CUSTOM THEME*/}
            {settings.theme == "customTheme" && (
              <>
                <label>Enter custom theme name:</label>
                <Input
                  style={{width: 200}}
                  value={settings.customTheme}
                  disabled={!isHost}
                  placeholder="Custom theme name"
                  onChange={(error) => setSettings({ ...settings, customTheme: error.target.value })}
                />
              </>
            )}


            {/*CUSTOM WORD LIST*/}
            {settings.theme == "customWordList" && (
              <>
                <label>Upload a custom word list:</label>
                <Upload
                  disabled={!isHost} // only host can upload
                  maxCount={1}
                  accept=".txt,.csv"
                  beforeUpload={(file) => {
                    setSettings({ ...settings, customWordList: file.name });
                    return false; // we only actually save the file name (no upload is happening yet --> out of scope for this user story)
                  }}
                  onRemove={() => setSettings({ ...settings, customWordList: "" })}
                >
                  <Button disabled={!isHost} style={{width: 200}}> {/* non-host players see grayed out box */}
                    Click to upload (.txt, .csv)
                  </Button>
                </Upload>
              </>
            )}


            {/*DIFFICULTY*/}
            <label>Difficulty:</label>
            <Select
              style={{width: 200}}
              value={settings.difficulty}
              disabled={!isHost}
              onChange={(val) => setSettings({ ...settings, difficulty: val as LobbySettings["difficulty"] })}
              options={[
                {value: "easy", label: "Easy"},
                {value: "medium", label: "Medium"},
                {value: "hard", label: "Hard"},
                {value: "all", label: "All"},
              ]}
            />


            {/*TIMER*/}
            <label>Round timer (seconds):</label>
            <InputNumber
              style={{width: 200}}
              min={10}
              max={300}
              value={settings.roundTimer}
              disabled={!isHost || timerDisabled}
              onChange={handleTimerChange}
            />

            <Checkbox
              disabled={!isHost}
              checked={timerDisabled}
              onChange={(event) => handleTimerDisabledChange(event.target.checked)}
            >
              No timer
            </Checkbox>


            {/*ROUNDS LIMIT*/}
            <label>Rounds limit:</label>
            <InputNumber
              style={{width: 200}}
              min={1}
              max={100}
              value={settings.roundsNumber}
              disabled={!isHost || roundsNumberDisabled}
              onChange={handleRoundsNumberChange}
            />

            <Checkbox
              disabled={!isHost}
              checked={roundsNumberDisabled}
              onChange={(event) => handleRoundsLimitDisabledChange(event.target.checked)}
            >
              No limit
            </Checkbox>


            {/*RESET & SAVE*/}
            {isHost && (
              <div style={{display: "flex", justifyContent: "center", gap: 10}}>
                <Button onClick={handleReset}>Reset to default</Button>
                <Button type="primary" onClick={handleSave}>Save Settings</Button>
              </div>
            )}

          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
