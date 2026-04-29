import { useState } from "react";
import { WordCard } from "@/types/wordCard";
import { ClueEvent } from "@/types/gameEvent";
import { User } from "@/types/user";
import { createGameSocket } from "@/utils/gameWebsocket";
import type { MessageInstance } from "antd/es/message/interface";

interface ClueFlowOptions {
  currentPlayer: User | null;
  currentTurn: "red" | "blue";
  board: WordCard[];
  socketRef: React.MutableRefObject<ReturnType<typeof createGameSocket> | null>;
  message: MessageInstance;
  // shared state from parent
  currentClue: { word: string; count: number } | null;
  setCurrentClue: (clue: { word: string; count: number } | null) => void;
  cluePublished: boolean;
  setCluePublished: (val: boolean) => void;
  clueHistory: { word: string; count: number; team: "red" | "blue" }[];
  setClueHistory: React.Dispatch<React.SetStateAction<{ word: string; count: number; team: "red" | "blue" }[]>>;
  penaltyPickMode: boolean;
  setPenaltyPickMode: (val: boolean) => void;
}

export function useClueFlow({
  currentPlayer, currentTurn, board, socketRef, message,
  currentClue, setCurrentClue,
  cluePublished, setCluePublished,
  clueHistory, setClueHistory,
  penaltyPickMode, setPenaltyPickMode,
}: ClueFlowOptions) {
  // clue state
  const [clueWord, setClueWord] = useState("");
  const [clueCount, setClueCount] = useState<number>(1);
  const [penaltyCardPicked, setPenaltyCardPicked] = useState<WordCard | null>(null);
  const [colorOverlayActive, setColorOverlayActive] = useState(false);

  const teamCardType = currentTurn === "red" ? "AGENTRED" : "AGENTBLUE";
  const remainingTeamCards = board.filter(c => c.cardType === teamCardType && !c.revealed).length;


  const handleSendClue = () => {
    if (cluePublished) { message.error("Clue already published."); return; }
    const trimmed = clueWord.trim();
    if (!trimmed) { message.error("Please enter a clue word."); return; }
    if (/\s/.test(trimmed)) { message.error("Clue must be a single word (no spaces)."); return; }
    if (/[0-9]/.test(trimmed)) { message.error("Clue may not contain numbers."); return; }
    if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?`~]/.test(trimmed)) { message.error("Clue may not contain special characters."); return; }

    if (currentPlayer && socketRef.current) {
      const clueEvent: ClueEvent = {
        type: "Clue",
        timeStamp: new Date().toISOString(),
        player: currentPlayer,
        description: `${currentPlayer.username} gave clue: ${trimmed} (${clueCount})`,
        word: trimmed,
        count: clueCount,
      };
      socketRef.current.sendClue(clueEvent);
    }
    setClueWord("");
    setClueCount(1);
  };

  const handleReportConfirm = () => {
    if (!currentPlayer || !currentClue || !socketRef.current) return;
    socketRef.current.sendClueReport({
      type: "ClueReported",
      timeStamp: new Date().toISOString(),
      player: currentPlayer,
      description: `${currentPlayer.username} reported clue`,
      word: currentClue.word,
      count: currentClue.count,
    });
  };

  const handleClueApproved = () => {
    if (!currentPlayer || !socketRef.current) return;
    socketRef.current.sendClueRuling({
      type: "ClueApproved",
      timeStamp: new Date().toISOString(),
      player: currentPlayer,
      description: `${currentPlayer.username} approved the clue`,
    });
  };

  const handleClueRuledInvalid = () => {
    if (!currentPlayer || !socketRef.current) return;
    socketRef.current.sendClueRuling({
      type: "ClueRuledInvalid",
      timeStamp: new Date().toISOString(),
      player: currentPlayer,
      description: `${currentPlayer.username} ruled the clue invalid`,
    });
  };

  const handlePenaltyCardClick = (card: WordCard) => {
    if (card.revealed) return;
    const isMyTeamCard =
      (currentTurn === "red" && card.cardType === "AGENTRED") ||
      (currentTurn === "blue" && card.cardType === "AGENTBLUE");
    if (!isMyTeamCard) {
      message.error(`You must cover one of your own (${currentTurn}) cards.`);
      return;
    }
    setPenaltyCardPicked(card);
  };

  const handlePenaltyConfirm = () => {
    if (!penaltyCardPicked || !currentPlayer || !socketRef.current) return;
    socketRef.current.sendGuess({
      type: "Guess",
      timeStamp: new Date().toISOString(),
      player: currentPlayer,
      description: `${currentPlayer.username} penalty-revealed ${penaltyCardPicked.word}`,
      guessedCard: penaltyCardPicked,
    });
    setPenaltyPickMode(false);
    setPenaltyCardPicked(null);
  };

  // reset on new game
  const resetClueState = () => {
    setCurrentClue(null);
    setCluePublished(false);
    setPenaltyPickMode(false);
    setPenaltyCardPicked(null);
    setClueWord("");
    setClueCount(1);
    setClueHistory([]);
  };

  return {
    // local-only state
    clueWord, setClueWord, clueCount, setClueCount,
    penaltyCardPicked, setPenaltyCardPicked,
    colorOverlayActive, setColorOverlayActive,
    remainingTeamCards,
    // pass-through (so page can access via clueFlow.xxx)
    currentClue, cluePublished, clueHistory, penaltyPickMode,
    // handlers
    handleSendClue, handleReportConfirm,
    handleClueApproved, handleClueRuledInvalid,
    handlePenaltyCardClick, handlePenaltyConfirm,
    resetClueState,
  };
}