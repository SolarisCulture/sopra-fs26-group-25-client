import { useState, useEffect, useRef, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { WordCard } from "@/types/wordCard";
import { GameStatistics } from "@/types/gameStatistics";

type ClueHistoryEntry = { word: string; count: number; team: "red" | "blue" };

export function useGameState(lobbyCode: string) {
  const apiService = useApi();

  // board
  const [board, setBoard] = useState<WordCard[]>([]);
  const [gameId, setGameId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const previousGameIdRef = useRef<number | null>(null);

  // players
  const [players, setPlayers] = useState<User[]>([]);
  const [blueSpymaster, setBlueSpymaster] = useState<User | null>(null);
  const [redSpymaster, setRedSpymaster] = useState<User | null>(null);
  const [blueSpies, setBlueSpies] = useState<User[]>([]);
  const [redSpies, setRedSpies] = useState<User[]>([]);
  const [role, setRole] = useState<User["role"] | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // turn
  const [currentTurn, setCurrentTurn] = useState<"red" | "blue">("red");
  const currentTurnRef = useRef<"red" | "blue">("red");
  const [currentPhase, setCurrentPhase] = useState<string>("");
  const currentPhaseRef = useRef("");
  const [clueHistory, setClueHistory] = useState<ClueHistoryEntry[]>([]);
  const [clueWord, setClueWord] = useState<string | null>(null);
  const [clueCount, setClueCount] = useState<number>(0);
  const [clueUnderReview, setClueUnderReview] = useState(false);
  const [invalidCluePenaltyPending, setInvalidCluePenaltyPending] = useState(false);

  // sync refs
  useEffect(() => { currentTurnRef.current = currentTurn; }, [currentTurn]);
  useEffect(() => { currentPhaseRef.current = currentPhase; }, [currentPhase]);

  // game over
  const [finished, setFinished] = useState(false);
  const [winningTeam, setWinningTeam] = useState<string | null>(null);
  const [finalBoard, setFinalBoard] = useState<WordCard[]>([]);
  const [gameStatistics, setGameStatistics] = useState<GameStatistics | null>(null);

  // current player
  const storedPlayerId = typeof window !== "undefined"
    ? sessionStorage.getItem(`playerId_${lobbyCode}`) : null;
  const currentPlayer = players.find(
    (p) => String(p.id) === String(storedPlayerId)
  ) ?? null;

  const fetchPlayers = useCallback(async () => {
    try {
      const lobbyData = await apiService.get<{ players: User[] }>(
        `/api/lobbies/${lobbyCode}`
      );
      const data = lobbyData.players || [];
      setPlayers(data);
      setBlueSpymaster(data.find(p => p.role === "SPYMASTER" && p.team === "BLUE") ?? null);
      setRedSpymaster(data.find(p => p.role === "SPYMASTER" && p.team === "RED") ?? null);
      setBlueSpies(data.filter(p => p.role === "SPY" && p.team === "BLUE"));
      setRedSpies(data.filter(p => p.role === "SPY" && p.team === "RED"));
    } catch {
      console.error("Failed to fetch players!");
    }
  }, [apiService, lobbyCode]);

  const fetchGameStatistics = useCallback(async () => {
    try {
      const stats = await apiService.get<GameStatistics>(
        `/api/games/${lobbyCode}/statistics`
      );
      setGameStatistics(stats);
      setWinningTeam(stats.winningTeam);
    } catch {
      console.error("Failed to fetch game statistics!");
      setGameStatistics(null);
    }
  }, [apiService, lobbyCode]);

  const fetchFinalBoard = useCallback(async () => {
    try {
      const boardData = await apiService.get<{ cards: WordCard[] }>(
        `/api/games/${lobbyCode}/board?role=SPYMASTER`
      );
      setFinalBoard(boardData.cards);
    } catch {
      console.error("Failed to fetch final board!");
      setFinalBoard([]);
    }
  }, [apiService, lobbyCode]);

  const fetchBoard = useCallback(async () => {
    try {
      const boardData = await apiService.get<{
        id: number;
        status: string;
        cards: WordCard[];
        currentTurn: "RED" | "BLUE";
        currentPhase: string;
        clueWord: string | null;
        clueCount: number;
        clueUnderReview: boolean;
        invalidCluePenaltyPending: boolean;
        clueHistory: ClueHistoryEntry[];
        remainingTimeSeconds?: number;
      }>(`/api/games/${lobbyCode}/board?role=${role === "SPYMASTER" ? "SPYMASTER" : "SPY"}`);
      setGameId(boardData.id);
      setStatus(boardData.status);
      setBoard(boardData.cards);
      setCurrentPhase(boardData.currentPhase);
      setCurrentTurn(boardData.currentTurn === "RED" ? "red" : "blue");
      setClueWord(boardData.clueWord ?? null);
      setClueCount(boardData.clueCount ?? 0);
      setClueUnderReview(boardData.clueUnderReview ?? false);
      setInvalidCluePenaltyPending(boardData.invalidCluePenaltyPending ?? false);
      setClueHistory(boardData.clueHistory ?? []);
      if (boardData.status === "FINISHED") {
        setFinished(true);
        await fetchFinalBoard();
        await fetchGameStatistics();
      }
      return boardData;
    } catch {
      console.error("Failed to fetch board!");
      return null;
    }
  }, [apiService, fetchFinalBoard, fetchGameStatistics, lobbyCode, role]);

  // fetch players on mount
   useEffect(() => {
    if (lobbyCode) fetchPlayers();
  }, [lobbyCode, fetchPlayers]);

  // fetch board when role is known
  useEffect(() => {
    if (lobbyCode && role) fetchBoard();
  }, [lobbyCode, role, fetchBoard]);

  // resolve role from players
  useEffect(() => {
    if (!lobbyCode || players.length === 0) return;
    const id = sessionStorage.getItem(`playerId_${lobbyCode}`);
    if (!id) { setLoadingRole(false); return; }
    const found = players.find(p => String(p.id) === String(id));
    if (found) setRole(found.role);
    setLoadingRole(false);
  }, [players, lobbyCode]);

  // detect game restart (new gameId)
  useEffect(() => {
    if (gameId == null) return;
    const prev = previousGameIdRef.current;
    if (prev != null && prev !== gameId) {
      setFinished(false);
      setFinalBoard([]);
      setGameStatistics(null);
      setClueHistory([]);
    }
    previousGameIdRef.current = gameId;
  }, [gameId]);

  return {
    board, setBoard, gameId, setGameId, status, setStatus,
    players, currentPlayer,
    blueSpymaster, redSpymaster, blueSpies, redSpies,
    role, loadingRole,
    currentTurn, setCurrentTurn, currentTurnRef,
    currentPhase, setCurrentPhase, currentPhaseRef,
    clueWord, setClueWord, clueCount, setClueCount,
    clueUnderReview, setClueUnderReview,
    invalidCluePenaltyPending, setInvalidCluePenaltyPending,
    clueHistory, setClueHistory,
    finished, setFinished,
    winningTeam, setWinningTeam,
    finalBoard, fetchFinalBoard,
    gameStatistics,
    fetchPlayers, fetchBoard, fetchGameStatistics,
  };
}
