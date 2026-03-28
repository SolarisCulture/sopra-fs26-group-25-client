"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "@/styles/page.module.css";
import { Button, Checkbox, ConfigProvider, Input, InputNumber, message, Modal, Select, Table, TableProps, Upload } from "antd";
import { LobbySettings, DEFAULT_SETTINGS } from "@/types/lobby";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";

export default function LobbyPage() {
  const apiService = useApi();
  const {lobbyCode} = useParams();
  const [link, setLink] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [settings, setSettings] = useState<LobbySettings>(DEFAULT_SETTINGS);
  const [timerDisabled, setTimerDisabled] = useState(false);
  const [roundsNumberDisabled, setRoundsNumberDisabled] = useState(true);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [players, setPlayers] = useState<User[] | null>(null);
  const [userID, setUserID] = useState("");

  // mock players to see table
//  const [players, setPlayers] = useState<User[] | null>([
//    {id: "1", username: "alice123", token: null},
//    {id: "2", username: "bob456", token: null},
//  ]);

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

  // fetch players useEffect
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await apiService.get<User[]>(`/lobbies/${lobbyCode}/players`);
        setPlayers(data);
      } catch (error) {
        message.error("Failed to fetch players!");
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 3000);
    return () => clearInterval(interval);
  }, [apiService, lobbyCode]);

  // link & host & id useEffect
  useEffect(() => {
    setLink(`${window.location.origin}/lobby/${lobbyCode}`);
    setIsHost(localStorage.getItem("hostedLobby") == lobbyCode);
    setUserID(JSON.parse(localStorage.getItem("userID") || '""'));
  }, [lobbyCode]); // use effect only runs again if lobbyCode changes --> won't actually happen

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
        <div style={{position: "absolute", bottom: 20, right: 20, display: "flex", alignItems: "center"}}>
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


        {/*SETTINGS*/}
        <Button 
          type="primary"
          onClick={() => {setSettingsOpen(true)}}
          style={{position: "absolute", bottom: 75, right: 20, display: "flex", alignItems: "center", width: "125px"}}
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
              <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
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