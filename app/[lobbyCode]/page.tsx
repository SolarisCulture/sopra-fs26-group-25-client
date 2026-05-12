"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState, useEffect, useRef } from "react";
import { App, Button, ConfigProvider } from "antd";

import { useLobby } from "@/hooks/useLobby";
import { useLobbySettings } from "@/hooks/useLobbySettings";
import { useLobbyWebSocket } from "@/hooks/useLobbyWebSocket";
import { User } from "@/types/user";
import { useApi } from "@/hooks/useApi";
import { Modal } from "antd";
import { Lobby } from "@/types/lobby";
import { JoinRequestData } from "@/utils/lobbyWebsocket";
import type { InputRef } from "antd";
import styles from "@/styles/lobby/lobby.module.css";

import HowToPlayModal from "@/components/HowToPlayModal";

import LobbyHeader from "@/components/lobby/LobbyHeader";
import PlayerList from "@/components/lobby/PlayerList";
import LobbyActions from "@/components/lobby/LobbyActions";
import StartGameButton from "@/components/lobby/StartGameButton";
import TeamTableModal from "@/components/lobby/TeamTableModal";
import LeaveModal from "@/components/lobby/LeaveModal";
import UsernameModal from "@/components/lobby/UsernameModal";
import SettingsModal from "@/components/lobby/SettingsModal";

export default function LobbyPage() {
  const apiService = useApi();
  const { message } = App.useApp();
  const router = useRouter();
  const { lobbyCode } = useParams();
  const code = String(lobbyCode);
  //const link = typeof window !== "undefined" ? `${window.location.origin}/${code}` : "";
  const [link, setLink] = useState("");

  useEffect(() => {
    setLink(`${globalThis.location.origin}/${code}`);
  }, [code]);

  // hooks
  const handleCurrentPlayerRemoved = useCallback((messageText?: string) => {
    if (messageText) {
      message.error("Server could not remove the player: " + messageText); // I really hope the backend has a good error message
      return;
    }
    sessionStorage.removeItem(`playerId_${code}`);
    sessionStorage.removeItem(`isHost_${code}`);
    router.push("/");
  }, [code, message, router]);

  const lobby = useLobby(code, message, handleCurrentPlayerRemoved);
  const lobbySettings = useLobbySettings(code, message);
  const [isStarting, setIsStarting] = useState(false);
  const [assignTarget, setAssignTarget] = useState<User | null>(null);
  const [kickTarget, setKickTarget] = useState<User | null>(null);
  

  // modals
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const [showUsernamePopUp, setShowUsernamePopUp] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [joiningLobby, setJoiningLobby] = useState(false);
  const usernameInputRef = useRef<InputRef>(null);

  // Check if user already joined on mount
  const lobbyRef = useRef(lobby);
  lobbyRef.current = lobby;

  useEffect(() => {
    const savedId = sessionStorage.getItem(`playerId_${code}`);
    if (savedId) {
      lobbyRef.current.setUserID(Number(savedId));
    } else {
      setShowUsernamePopUp(true);
    }
  }, [code]);
  
  // Focus username input when popup opens
  useEffect(() => {
    if (!showUsernamePopUp) return;
    const timer = setTimeout(() => {
      usernameInputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [showUsernamePopUp]);

  const handleJoin = async () => {
    const username = usernameInput.trim();

    if (username.length < 1 || username.length > 50) {
      setUsernameError("Username must be between 1 and 50 characters.");
      return;
    }

    if (code === "new") {
      setJoiningLobby(true);
      try {
        const newLobby = await apiService.post<Lobby>("/api/lobbies", { hostUsername: username });
        sessionStorage.setItem("hostedLobby", newLobby.lobbyCode);
        sessionStorage.setItem(`playerId_${newLobby.lobbyCode}`, String(newLobby.hostId));
        router.push(`/${newLobby.lobbyCode}`);
      } catch {
        setUsernameError("Server failed to create lobby. Please try again.");
        return;
      } finally {
        setJoiningLobby(false);
      }
      return;
    }

    setJoiningLobby(true);
    setUsernameError("");

    try {
      const response = await apiService.post<{ id: number }>(`/api/lobbies/${code}/join`, username);
      const newPlayerID = response.id;
      sessionStorage.setItem(`playerId_${code}`, String(newPlayerID));

      const createdThisLobby = sessionStorage.getItem("hostedLobby") === code;
      if (createdThisLobby) {
        sessionStorage.setItem(`isHost_${code}`, "true");
        sessionStorage.removeItem("hostedLobby");
        lobby.setIsHost(true);
      }

      lobby.setUserID(newPlayerID);
      setShowUsernamePopUp(false);
    } catch (error: unknown){
        const err = error as {
          status?: number;
          data?: {
            message?: string;
            error?: string;
          };
          message?: string;
        };

        if (err.status === 404) {
          setUsernameError("This lobby does not exist.");
        } else if (err.status === 409 && err.message?.includes("username")) {
          setUsernameError("This username is already taken.");
        } else if (err.status === 409 && err.message?.includes("game")) {
          setUsernameError("This game is already running.");
        } else {
          setUsernameError("Failed to join lobby. Please try again.");
        }
    } finally {
      setJoiningLobby(false);
    }
  };

  // websocket
  useLobbyWebSocket({
    lobbyCode: code,
    userID: lobby.userID,
    fetchLobby: lobby.fetchLobby,
    setSettings: lobbySettings.setSettings,
    setIsStarting,
    isHost: lobby.isHost,
    onCurrentPlayerRemoved: handleCurrentPlayerRemoved,
    onGameStart: () => router.push(`/${code}/game`),
    onJoinRequest: (request: JoinRequestData) => {
      Modal.confirm({
        title: "Join Request",
        content: `${request.requesterName} wants to join Team ${request.requestedTeam}.`,
        onOk: () => lobby.handleAssignTeam(request.requesterId, request.requestedTeam),
        okText: "Accept",
        cancelText: "Deny",
      });
    },
    message,
  });

  const allAssigned =
    lobby.players.length >= 4
    && lobby.players.every(p => p.team !== "UNASSIGNED" && p.team !== null)
    && lobby.players.filter(p => p.team == "BLUE").some(p => p.role == "SPYMASTER")
    && lobby.players.filter(p => p.team == "RED").some(p => p.role == "SPYMASTER");

  return (
    <ConfigProvider
      theme={{
        components: {
          Select: { colorText: "#000", colorBgContainer: "#fff" },
          Input: { colorText: "#000", colorBgContainer: "#fff" },
          InputNumber: { colorText: "#000", colorBgContainer: "#fff" },
          Modal: { colorText: "#000", colorBgContainer: "#fff" },
          Checkbox: { colorText: "#000", colorBgContainer: "#fff" },
          Table: { colorText: "#fff", colorBgContainer: "rgba(250, 250, 250, 0.25)" }
        },
      }}>
      <App>
        <div className={styles.container}>
          <Modal
            title={<div style={{ color: "#000", textAlign: "center" }}>Enter Username</div>}
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
              inputRef={usernameInputRef}
              onChange={(val: string) => { setUsernameInput(val); setUsernameError(""); }}
              onJoin={handleJoin}
            />
          </Modal>

          <LobbyHeader
            lobbyCode={code}
            link={link}
            onCopy={() => {
              navigator.clipboard.writeText(link);
              message.success("Copied!");
            }}
          />

          <h1 className={styles.title}>Lobby</h1>

          <div className={styles.main}>
            <PlayerList
              players={lobby.players}
              isHost={lobby.isHost}
              currentUserID={lobby.userID}
              onAssign={setAssignTarget}
              onTransferHost={lobby.handleTransferHost}
              onKick={setKickTarget}
            />
            <TeamTableModal
              players={lobby.players}
              isHost={lobby.isHost}
              currentUserID={lobby.userID}
              onAssign={lobby.handleAssignTeam}
              onMakeSpymaster={lobby.handleAssignRole}
              assignTarget={assignTarget}
              setAssignTarget={setAssignTarget}
            />
          </div>

          {lobby.isHost && (
            <StartGameButton
              allAssigned={allAssigned}
              isStarting={isStarting}
              onStart={async () => {
                  try {
                    message.success(`The game is starting now, please wait!`);
                    setIsStarting(true);
                    await apiService.post(`/api/games/${lobbyCode}/start`, {});
                  } catch {
                    message.error("Server failed to start game. Try Again.");
                  }
                }}
            />
          )}

          <LobbyActions
            onSettings={() => setSettingsOpen(true)}
            onHowToPlay={() => setHowToPlayOpen(true)}
            onLeave={() => setLeaveOpen(true)}
          />

          <HowToPlayModal open={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} />
          <LeaveModal
            open={leaveOpen}
            onStay={() => setLeaveOpen(false)}
            onLeave={async () => {
              await lobby.handleLeave();
              router.push("/");
            }}
          />
          <Modal
            title={<div style={{ color: "#000" }}>Are you sure you want to kick this player?</div>}
            open={kickTarget !== null}
            closable={false}
            footer={null}
          >
            <p>This will remove {kickTarget?.username} from the lobby.</p>
            <div style={{ display: "flex", justifyContent: "right", gap: 10, marginTop: "10px" }}>
              <Button onClick={() => setKickTarget(null)}>No, keep them.</Button>
              <Button
                type="primary"
                onClick={async () => {
                  if (kickTarget) await lobby.handleKick(kickTarget);
                  setKickTarget(null);
                }}
              >
                Yes, kick.
              </Button>
            </div>
          </Modal>
          <SettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            isHost={lobby.isHost}
            settings={lobbySettings.settings}
            setSettings={lobbySettings.setSettings}
            spymasterTimerDisabled={lobbySettings.spymasterTimerDisabled}
            spyTimerDisabled={lobbySettings.spyTimerDisabled}
            spymasterTimerDraft={lobbySettings.spymasterTimerDraft}
            spyTimerDraft={lobbySettings.spyTimerDraft}
            setSpymasterTimerDraft={lobbySettings.setSpymasterTimerDraft}
            setSpyTimerDraft={lobbySettings.setSpyTimerDraft}
            roundsNumberDisabled={lobbySettings.roundsNumberDisabled}
            onSpymasterTimerDisabledChange={lobbySettings.handleSpymasterTimerDisabledChange}
            onSpyTimerDisabledChange={lobbySettings.handleSpyTimerDisabledChange}
            onRoundsLimitDisabledChange={lobbySettings.handleRoundsLimitDisabledChange}
            onRoundsNumberChange={lobbySettings.handleRoundsNumberChange}
            validateAndCommitTimer={lobbySettings.validateAndCommitTimer}
            onReset={lobbySettings.handleReset}
            onSave={lobbySettings.handleSave}
          />
        </div>
      </App>
    </ConfigProvider>
  );
}
