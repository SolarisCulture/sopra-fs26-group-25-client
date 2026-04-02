"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "@/styles/page.module.css";
import { Alert, Button, Checkbox, ConfigProvider, Input, InputNumber, message, Modal, Select, Table, TableProps, Upload } from "antd";
import { LobbySettings, DEFAULT_SETTINGS } from "@/types/lobby";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";

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
        const isCurrentHost = player.isHost;
          return (
            <span style={{display: "flex", justifyContent: "space-between"}}>
              <span>{username}</span>
              {isCurrentHost && <span>👑</span>}
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
      } catch (error) {
        message.error("Failed to fetch players!");
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 3000);
    return () => clearInterval(interval);
  }, [apiService, lobbyCode]);

  // check on page load if user already joined this lobby (show pop-up otherwise)
  useEffect(() => {
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
    } catch (error) {
      message.error("Failed to leave lobby!");
    }
  };

  // save settings 
  const handleSave = async () => {
    try {
      await apiService.put(`/api/lobbies/${lobbyCode}`, settings);
      message.success("Settings saved!");
    } catch (error) {
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
    if (val < 10) { message.warning(`${label} cannot be less than 10 seconds.`); return; }
    if (val > 3600) { message.warning(`${label} cannot exceed 3600 seconds.`); return; }
    onCommit(val);
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

        {/*INPUT USERNAME POP-UP*/}
        <Modal
          title={<div style={{ color: "#000", textAlign: "center" }}>Enter Username</div>}
          open={showUsernamePopUp}
          closable={false}
          maskClosable={false}
          footer={null}
        >
          <div style={{display: "flex", flexDirection: "column", gap: 12, padding: "8px 0",}}>
            <Input
              placeholder="Username (must be between 1 and 50 characters)"
              value={usernameInput}
              maxLength={50}
              status={usernameError ? "error" : ""}
              onChange={event => { setUsernameInput(event.target.value); setUsernameError(""); }}
              onPressEnter={handleJoin}
            />
            {usernameError &&
              <Alert
                title={usernameError}
                type="error"
                showIcon />}
              <Button
                type="primary"
                loading={joiningLobby}
                onClick={handleJoin}
                block
              >
              Join Lobby
            </Button>
          </div>
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


            {/*SPYMASTER TIMER*/}
            <label>Spymaster timer (seconds):</label>
            <InputNumber
              style={{width: 200}}
              value={settings.spymasterTimer}
              disabled={!isHost || spymasterTimerDisabled}
              onChange={(val) => setSpymasterTimerDraft(val)}
              onBlur={() => validateAndCommitTimer(spymasterTimerDraft, "Spymaster timer", (v) => setSettings({ ...settings, spymasterTimer: v }))}
              onKeyDown={(e) => { if (e.key === "Enter") validateAndCommitTimer(spymasterTimerDraft, "Spymaster timer", (v) => setSettings({ ...settings, spymasterTimer: v })); }}
              onStep={(val) => validateAndCommitTimer(val, "Spymaster timer", (v) => { setSpymasterTimerDraft(v); setSettings({ ...settings, spymasterTimer: v }); })}
            />
            <Checkbox
              disabled={!isHost}
              checked={spymasterTimerDisabled}
              onChange={(e) => handleSpymasterTimerDisabledChange(e.target.checked)}
            >
              No timer
            </Checkbox>

            {/*SPY TIMER*/}
            <label>Spy timer (seconds):</label>
            <InputNumber
              style={{width: 200}}
              value={settings.spyTimer}
              disabled={!isHost || spyTimerDisabled}
              onChange={(val) => setSpyTimerDraft(val)}
              onBlur={() => validateAndCommitTimer(spyTimerDraft, "Spy timer", (v) => setSettings({ ...settings, spyTimer: v }))}
              onKeyDown={(e) => { if (e.key === "Enter") validateAndCommitTimer(spyTimerDraft, "Spy timer", (v) => setSettings({ ...settings, spyTimer: v })); }}
              onStep={(val) => validateAndCommitTimer(val, "Spy timer", (v) => { setSpyTimerDraft(v); setSettings({ ...settings, spyTimer: v }); })}
            />
            <Checkbox
              disabled={!isHost}
              checked={spyTimerDisabled}
              onChange={(e) => handleSpyTimerDisabledChange(e.target.checked)}
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