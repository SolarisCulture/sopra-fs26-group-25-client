import { useEffect, useRef } from "react";
import { createGameSocket } from "@/utils/gameWebsocket";
import { User } from "@/types/user";
import { WordCard } from "@/types/wordCard";
import { ChatMessage } from "@/types/chatMessage";
import type { MessageInstance } from "antd/es/message/interface";
import message from "antd/es/message";

interface GameSocketOptions {
  lobbyCode: string;
  role: User["role"] | null;
  playerId: number | null;
  currentTurnRef: React.MutableRefObject<"red" | "blue">;
  setBoard: (cards: WordCard[]) => void;
  setCurrentPhase: (phase: string) => void;
  setCurrentTurn: (turn: "red" | "blue") => void;
  setGameId: (id: number) => void;
  setStatus: (status: string) => void;
  setClueWord: (word: string | null) => void;
  setClueCount: (count: number) => void;
  setClueUnderReview: (val: boolean) => void;
  setInvalidCluePenaltyPending: (val: boolean) => void;
  setFinished: (val: boolean) => void;
  setCurrentClue: (clue: { word: string; count: number } | null) => void;
  setCluePublished: (val: boolean) => void;
  setClueHistory: React.Dispatch<React.SetStateAction<{ word: string; count: number; team: "red" | "blue" }[]>>;
  setClueReviewOpen: (val: boolean) => void;
  setPenaltyPickMode: (val: boolean) => void;
  setWinningTeam: (team: string | null) => void;
  setPauseModalOpen: (val: boolean) => void;
  setRemainingTime: (val: number | null) => void;
  fetchBoard: () => Promise<{ remainingTimeSeconds?: number } | null>;
  fetchPlayers: () => Promise<void>;
  fetchFinalBoard: () => Promise<void>;
  fetchGameStatistics: () => Promise<void>;
  onReturnToLobby: () => void;
  message: MessageInstance;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export function useGameSocket(opts: GameSocketOptions) {
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const socketRef = useRef<ReturnType<typeof createGameSocket> | null>(null);

  useEffect(() => {
    const { lobbyCode, role, playerId } = optsRef.current;
    if (!lobbyCode || !role || role === "NONE" || !playerId) return;
    if (socketRef.current) return;

    const socket = createGameSocket(
      lobbyCode,
      role,
      playerId,
      (event) => {
        const o = optsRef.current;
        const syncTimerFromBoard = () => {
          if ("board" in event && event.board?.remainingTimeSeconds != null) {
            o.setRemainingTime(Number(event.board.remainingTimeSeconds));
          }
        };
        const syncBoardState = () => {
          if (!("board" in event) || !event.board) return;
          o.setStatus(event.board.status);
          o.setClueWord(event.board.clueWord ?? null);
          o.setClueCount(event.board.clueCount ?? 0);
          o.setClueUnderReview(event.board.clueUnderReview ?? false);
          o.setInvalidCluePenaltyPending(event.board.invalidCluePenaltyPending ?? false);
        };

        switch (event.type) {
          case "Clue":
            syncBoardState();
            o.setCurrentPhase(event.board.currentPhase);
            o.setCurrentClue({ word: event.board.clueWord ?? "", count: event.board.clueCount });
            o.setClueHistory(prev => [{
              word: event.board.clueWord ?? "",
              count: event.board.clueCount,
              team: o.currentTurnRef.current,
            }, ...prev]);
            o.setCluePublished(true);
            o.setBoard(event.board.cards);
            o.setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
            syncTimerFromBoard();
            break;
          case "Guess":
            syncBoardState();
            o.setBoard(event.board.cards);
            o.setCurrentPhase(event.board.currentPhase);
            o.setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
            if (event.board.currentPhase === "SPYMASTER_TURN") {
              o.setCluePublished(false);
              o.setCurrentClue(null);
              o.setClueReviewOpen(false);
              o.setPenaltyPickMode(false);
            }
            syncTimerFromBoard();
            break;
          case "ClueReported":
            o.setClueReviewOpen(true);
            break;
          case "ClueApproved":
            o.setClueReviewOpen(false);
            o.message.success("Clue approved!");
            break;
          case "ClueRuledInvalid":
            o.setClueReviewOpen(false);
            o.setClueHistory(prev => prev.slice(1));
            o.setCurrentClue(null);
            o.setCluePublished(false);
            o.setPenaltyPickMode(true);
            o.message.warning("Clue ruled invalid!");
            break;
          case "TurnChanged":
            syncBoardState();
            o.setCurrentPhase(event.board.currentPhase);
            o.setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
            o.setCluePublished(false);
            o.setCurrentClue(null);
            o.setBoard(event.board.cards);
            syncTimerFromBoard();
            break;
          case "GameStarted":
            syncBoardState();
            o.setGameId(event.board.id);
            o.setBoard(event.board.cards);
            o.setCurrentPhase(event.board.currentPhase);
            o.setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
            o.setCluePublished(false);
            o.setCurrentClue(null);
            syncTimerFromBoard();
            break;
          case "GameOver":
            o.setFinished(true);
            o.setRemainingTime(null);
            o.fetchFinalBoard();
            o.fetchGameStatistics();
            break;
          case "ReturningToLobby":
            o.setWinningTeam(null);
            socketRef.current?.disconnect();
            o.onReturnToLobby();
            break;
          case "ReturningToLobbyAfterDisconnect":
            message.error(`After a disconnect, there aren't enough players left! Returning to the lobby!`);
            o.setWinningTeam(null);
            setTimeout(() => {
              socketRef.current?.disconnect();
              o.onReturnToLobby();
            }, 3000);
            break;
          case "GameRestarting":
            o.setWinningTeam(null);
            o.setRemainingTime(null);
            if (event.board) {
              syncBoardState();
              o.setGameId(event.board.id);
              o.setBoard(event.board.cards);
              o.setCurrentPhase(event.board.currentPhase);
              o.setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
              syncTimerFromBoard();
            }
            o.setCluePublished(false);
            break;
          case "GamePaused":
            o.setPauseModalOpen(true);
            o.setStatus("PAUSE");
            break;
          case "GameResumed":
            o.setPauseModalOpen(false);
            o.setStatus("ACTIVE");
            break;
          case "PlayersUpdated":
            o.fetchPlayers();
            break;
          case "TIMER_UPDATE": {
            const remaining = event.timer ?? event.remainingTime ?? event.data ?? event.board?.remainingTimeSeconds;
            if (remaining != null) {
              o.setRemainingTime(Number(remaining));
            }
            break;
          }
          case "CHAT_MESSAGE": {
            const newMsg: ChatMessage = {
              id: `${event.timestamp}-${event.senderName}`,
              username: event.senderName,
              text: event.content,
              team: event.team?.toLowerCase() as "red" | "blue",
              timeStamp: event.timestamp,
            };
            o.setChatMessages((prev) => [...prev, newMsg]);
            break;
          }
        }
      },
      () => {
        const o = optsRef.current;
        o.fetchBoard().then((boardData) => {
          if (boardData && "remainingTimeSeconds" in boardData && boardData.remainingTimeSeconds != null) {
            o.setRemainingTime(Number(boardData.remainingTimeSeconds));
          }
        });
        o.fetchPlayers();
      }
    );

    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [opts.lobbyCode, opts.role, opts.playerId]);

  return socketRef;
}
