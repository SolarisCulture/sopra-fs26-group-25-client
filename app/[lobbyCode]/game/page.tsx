"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { App, Button, ConfigProvider, Modal } from "antd";
import { useApi } from "@/hooks/useApi";

import { useGameState } from "@/hooks/useGameState";
import { useClueFlow } from "@/hooks/useClueFlow";
import { useGameSocket } from "@/hooks/useGameSocket";
import { useDictionary } from "@/hooks/useDictionary";
import { WordCard } from "@/types/wordCard";
import styles from "@/styles/game/game.module.css";

import HowToPlayModal from "@/components/HowToPlayModal";

import GameBoard from "@/components/game/GameBoard";
import GameActions from "@/components/game/GameActions";
import GameOverScreen from "@/components/game/GameOverScreen";
import DictionaryModal from "@/components/game/DictionaryModal";
import PlayerTable from "@/components/game/PlayerTable";
import ClueHistory from "@/components/game/ClueHistory";
import ClueInput from "@/components/game/ClueInputs";
import ReportConfirmationModal from "@/components/game/ReportConfirmationModal";
import ClueReviewModal from "@/components/game/ReviewClueModal";
import PenaltyConfirmModal from "@/components/game/ConfirmPenaltyCardRevealModal";
import QuitGameModal from "@/components/game/QuitGameModal";


export default function GamePage() {
  const { message } = App.useApp();
  const apiService = useApi();
  const router = useRouter();
  const { lobbyCode } = useParams();
  const code = String(lobbyCode);

  const game = useGameState(code);
  const [isRestarting, setIsRestarting] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [reportConfirmOpen, setReportConfirmOpen] = useState(false);
  const [endTurnConfirmOpen, setEndTurnConfirmOpen] = useState(false);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [quitModalOpen, setQuitModalOpen] = useState(false);
  const [quitFromPause, setQuitFromPause] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const [currentClue, setCurrentClue] = useState<{ word: string; count: number } | null>(null);
  const [cluePublished, setCluePublished] = useState(false);
  const [penaltyPickMode, setPenaltyPickMode] = useState(false);
  const [clueReviewOpen, setClueReviewOpen] = useState(false);
  
  const socketRef = useGameSocket({
    lobbyCode: code, role: game.role,
    currentTurnRef: game.currentTurnRef,
    setBoard: game.setBoard, 
    setCurrentPhase: game.setCurrentPhase,
    setCurrentTurn: game.setCurrentTurn, 
    setGameId: game.setGameId,
    setFinished: game.setFinished, 
    setWinningTeam: game.setWinningTeam,
    setCurrentClue,
    setCluePublished,
    setClueHistory: game.setClueHistory,
    setClueReviewOpen,
    setPenaltyPickMode,
    setPauseModalOpen,
    setRemainingTime,
    fetchBoard: game.fetchBoard, 
    fetchPlayers: game.fetchPlayers,
    fetchFinalBoard: game.fetchFinalBoard,
    fetchGameStatistics: game.fetchGameStatistics,
    onReturnToLobby: () => router.push(`/${code}`),
    message,
  });

  const clueFlow = useClueFlow({
    currentPlayer: game.currentPlayer,
    currentTurn: game.currentTurn,
    board: game.board,
    socketRef,
    message,
    // pass in the shared state so clueFlow uses it instead of creating its own
    currentClue, setCurrentClue,
    cluePublished, setCluePublished,
    clueHistory: game.clueHistory,
    setClueHistory: game.setClueHistory,
    penaltyPickMode, setPenaltyPickMode,
  });

  const dictionary = useDictionary(message);

  const isMyTurn = game.currentPlayer?.team?.toLowerCase() === game.currentTurn;
  const canEndTurn = isMyTurn && game.role !== "SPYMASTER" && clueFlow.cluePublished;
  const isHost = game.currentPlayer?.isHost === true;
  const isSpymaster = game.role === "SPYMASTER";
  const opposingSpymaster = game.players.find(
    p => p.team !== game.currentTurn.toUpperCase() && p.role === "SPYMASTER"
  ) ?? null;
  const isOpposingSpymaster = opposingSpymaster != null &&
    String(opposingSpymaster.id) === String(game.currentPlayer?.id);
  const teamClass = game.currentTurn === "red" ? styles.teamRed : styles.blueTeam;
  const isSpyPhase = game.currentPhase === "SPY_TURN";

  const handleCardClick = (card: WordCard) => {
    if (card.revealed || !game.currentPlayer) return;
    if (clueFlow.penaltyPickMode) { clueFlow.handlePenaltyCardClick(card); return; }
    if (isSpymaster) { message.error("You are not a spy!"); return; }
    if (!isMyTurn) { message.error("It is not your turn yet!"); return; }
    if (socketRef.current) {
      socketRef.current.sendGuess({
        type: "Guess", timeStamp: new Date().toISOString(),
        player: game.currentPlayer,
        description: `${game.currentPlayer.username} guessed ${card.word}`,
        guessedCard: card,
      });
    }
  };

  const handleEndTurnConfirm = () => {
    if (!socketRef.current || !game.currentPlayer) return;
    socketRef.current.sendTurnChange({
      type: "TurnChanged", timeStamp: new Date().toISOString(),
      player: game.currentPlayer,
      description: `${game.currentPlayer.username} ended the turn.`,
      team: game.currentTurn === "red" ? "blue" : "red",
    });
    setEndTurnConfirmOpen(false);
    message.success(`Turn passed to ${game.currentTurn === "red" ? "BLUE" : "RED"} team`);
  };

  const handleConfirmQuit = async () => {
    try {
      await apiService.post(`/api/games/${code}/backToLobby`, {});
      setQuitModalOpen(false);
    } catch {
      message.error("Server failed to quit the game.");
    }
  };

  return (
    <ConfigProvider theme={{
      components: {
        Input: { colorText: "#000", colorBgContainer: "#fff" },
        InputNumber: { colorText: "#000", colorBgContainer: "#fff" },
        Modal: { colorText: "#000", colorBgContainer: "#fff" },
      },
    }}>
      <PlayerTable
        currentTurn={game.currentTurn} currentPhase={game.currentPhase}
        remainingTime={remainingTime}
        blueSpymaster={game.blueSpymaster} redSpymaster={game.redSpymaster}
        blueSpies={game.blueSpies} redSpies={game.redSpies}
      />

      <div className={`${styles.page} ${teamClass}`}>
        <ClueHistory clueHistory={clueFlow.clueHistory} />

        <GameBoard
          board={game.board}
          penaltyPickMode={clueFlow.penaltyPickMode}
          colorOverlayActive={clueFlow.colorOverlayActive}
          currentTurn={game.currentTurn}
          onCardClick={handleCardClick}
          canClickCards={!isSpymaster && isSpyPhase && isMyTurn}
        />

        {isSpymaster && isMyTurn && !clueFlow.penaltyPickMode &&
          game.currentPhase === "SPYMASTER_TURN" && (
          <ClueInput
            clueWord={clueFlow.clueWord} setClueWord={clueFlow.setClueWord}
            clueCount={clueFlow.clueCount} setClueCount={clueFlow.setClueCount}
            onSend={clueFlow.handleSendClue} disabled={clueFlow.cluePublished}
            remainingTeamCards={clueFlow.remainingTeamCards}
          />
        )}
      </div>

      <GameActions
        role={game.role} cluePublished={clueFlow.cluePublished}
        canEndTurn={canEndTurn} isHost={isHost} isSpymaster={isSpymaster}
        colorOverlayActive={clueFlow.colorOverlayActive}
        dictionaryLoading={dictionary.dictionaryLoading}
        onReport={() => { if (clueFlow.cluePublished) setReportConfirmOpen(true); }}
        onEndTurn={() => setEndTurnConfirmOpen(true)}
        onToggleOverlay={() => clueFlow.setColorOverlayActive(prev => !prev)}
        onDictionary={() => dictionary.setDictionaryOpen(true)}
        onHowToPlay={() => setHowToPlayOpen(true)}
        onPause={() => socketRef.current?.sendPause(true)}
        onQuit={() => {
          setQuitFromPause(false);
          setQuitModalOpen(true);
        }}
      />

      <Modal title="Confirm End Turn" open={endTurnConfirmOpen}
        onOk={handleEndTurnConfirm} onCancel={() => setEndTurnConfirmOpen(false)}
        closable={false} okText="End Turn" cancelText="Cancel">
        <p>Are you sure you want to end your team&apos;s turn?</p>
      </Modal>

      <DictionaryModal
        open={dictionary.dictionaryOpen} search={dictionary.dictionarySearch}
        onSearchChange={dictionary.setDictionarySearch}
        onSearch={dictionary.handleSearch} onClose={dictionary.closeDictionary}
        result={dictionary.dictionaryResult}
        resultOpen={dictionary.dictionaryResultOpen}
        onCloseResult={dictionary.closeResult}
      />

      <HowToPlayModal open={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} />
      <ReportConfirmationModal
        reportConfirmOpen={reportConfirmOpen}
        onCancel={() => setReportConfirmOpen(false)}
        onConfirm={clueFlow.handleReportConfirm}
        currentClue={clueFlow.currentClue}
      />
      <ClueReviewModal
        clueReviewOpen={clueReviewOpen} isOpposingSpymaster={isOpposingSpymaster}
        currentClue={clueFlow.currentClue}
        onApprove={clueFlow.handleClueApproved} onReject={clueFlow.handleClueRuledInvalid}
        currentTurn={game.currentTurn}
      />
      <PenaltyConfirmModal
        open={clueFlow.penaltyCardPicked !== null}
        penaltyCardPicked={clueFlow.penaltyCardPicked}
        onConfirm={clueFlow.handlePenaltyConfirm}
        setPenaltyConfirmOpen={() => clueFlow.setPenaltyCardPicked(null)}
        setPenaltyCardPicked={clueFlow.setPenaltyCardPicked}
      />

      <Modal
        title={<div style={{ color: "#000" }}>Game Paused</div>}
        open={pauseModalOpen}
        closable={false}
        footer={null}
        centered
        maskClosable={false}
      >
        {isHost ? (
          <>
            <p>The game is currently paused. What would you like to do?</p>
            <div style={{ display: "flex", justifyContent: "right", gap: 10, marginTop: "20px" }}>
              <Button type="primary" onClick={() => socketRef.current?.sendPause(false)}>
                Resume Game
              </Button>
              <Button
                onClick={() => {
                  setPauseModalOpen(false);
                  setQuitFromPause(true);
                  setQuitModalOpen(true);
                }}
              >
                Quit Game
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.finishedBox}>
            <h2 className={styles.finishedTitle}>Game Paused</h2>
            <p className={styles.finishedText}>Please wait for host action...</p>
          </div>
        )}
      </Modal>

      <QuitGameModal
        open={quitModalOpen}
        onStay={() => {
          setQuitModalOpen(false);
          if (quitFromPause) setPauseModalOpen(true);
          setQuitFromPause(false);
        }}
        onQuit={handleConfirmQuit}
      />

      {game.finished && (
        <GameOverScreen
          winningTeam={game.winningTeam} finalBoard={game.finalBoard} isHost={isHost}
          isRestarting={isRestarting}
          onRestart={async () => {
            try { 
              setIsRestarting(true);
              await apiService.post(`/api/games/${code}/restart`, {});
            }
            catch {
              message.error("Server failed to restart game. Try again.");
              return;
            } finally {
              setIsRestarting(false);
              setCluePublished(false);
            }
          }}
          onBackToLobby={async () => {
            try { await apiService.post(`/api/games/${code}/backToLobby`, {}); }
            catch { message.error("Server failed to return you to the lobby."); }
          }}
        />
      )}
    </ConfigProvider>
  );
}
