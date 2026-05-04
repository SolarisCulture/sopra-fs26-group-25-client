import { useEffect, useRef } from "react";
import { createGameSocket } from "@/utils/gameWebsocket";
import { User } from "@/types/user";
import { WordCard } from "@/types/wordCard";
import type { MessageInstance } from "antd/es/message/interface";

interface GameSocketOptions {
  lobbyCode: string;
  role: User["role"] | null;
  currentTurnRef: React.MutableRefObject<"red" | "blue">;
  setBoard: (cards: WordCard[]) => void;
  setCurrentPhase: (phase: string) => void;
  setCurrentTurn: (turn: "red" | "blue") => void;
  setGameId: (id: number) => void;
  setFinished: (val: boolean) => void;
  setCurrentClue: (clue: { word: string; count: number } | null) => void;
  setCluePublished: (val: boolean) => void;
  setClueHistory: React.Dispatch<React.SetStateAction<{ word: string; count: number; team: "red" | "blue" }[]>>;
  setClueReviewOpen: (val: boolean) => void;
  setPenaltyPickMode: (val: boolean) => void;
  setWinningTeam: (team: string | null) => void;
  setPauseModalOpen: (val: boolean) => void;
  fetchBoard: () => Promise<ReturnType<typeof Object> | null>;
  fetchPlayers: () => Promise<void>;
  fetchFinalBoard: () => Promise<void>;
  fetchGameStatistics: () => Promise<void>;
  onReturnToLobby: () => void;
  message: MessageInstance;
}

export function useGameSocket(opts: GameSocketOptions) {
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const socketRef = useRef<ReturnType<typeof createGameSocket> | null>(null);

  useEffect(() => {
    const { lobbyCode, role } = optsRef.current;
    if (!lobbyCode || !role || role === "NONE") return;
    if (socketRef.current) return;

    const socket = createGameSocket(
      lobbyCode,
      role,
      (event) => {
        const o = optsRef.current;
        switch (event.type) {
          case "Clue":
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
            break;
          case "Guess":
            o.setBoard(event.board.cards);
            o.setCurrentPhase(event.board.currentPhase);
            o.setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
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
            o.setCurrentPhase(event.board.currentPhase);
            o.setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
            o.setCluePublished(false);
            o.setCurrentClue(null);
            o.setBoard(event.board.cards);
            break;
          case "GameOver":
            o.setFinished(true);
            o.fetchFinalBoard();
            o.fetchGameStatistics();
            break;
          case "ReturningToLobby":
            o.setWinningTeam(null);
            socketRef.current?.disconnect();
            o.onReturnToLobby();
            break;
          case "GameRestarting":
            o.setWinningTeam(null);
            if (event.board) {
              o.setGameId(event.board.id);
              o.setBoard(event.board.cards);
              o.setCurrentPhase(event.board.currentPhase);
              o.setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
            }
            break;
          case "GamePaused":
            o.setPauseModalOpen(true);
            break;
          case "GameResumed":
            o.setPauseModalOpen(false);
            break;
        }
      },
      () => {
        const o = optsRef.current;
        o.fetchBoard();
        o.fetchPlayers();
      }
    );

    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [opts.lobbyCode, opts.role]);

  return socketRef;
}
