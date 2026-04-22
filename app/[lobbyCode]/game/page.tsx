"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { WordCard } from "@/types/wordCard";
import { GuessEvent, ClueEvent } from "@/types/gameEvent";
import { createGameSocket } from "@/utils/gameWebsocket";
import { useRouter } from "next/navigation";
import styles from "@/styles/game.module.css";
import { Button, message, ConfigProvider, Modal, Input } from "antd";
import HowToPlayModal from "@/components/HowToPlayModal";
import ClueHistory from "@/components/ClueHistory";
import ClueInput from "@/components/ClueInputs";
import ReportConfirmationModal from "@/components/ReportConfirmationModal";
import ClueReviewModal from "@/components/ReviewClueModal";
import PenaltyConfirmModal from "@/components/ConfirmPenaltyCardRevealModal";
import PlayerTable from "@/components/PlayerTable";

export default function GamePage() {
    const apiService = useApi();
    const router = useRouter();
    const { lobbyCode } = useParams();
    const socketRef = useRef<ReturnType<typeof createGameSocket> | null>(null);

    // Doesn't update correctly else --> more consistent
    const [currentPhase, setCurrentPhase] = useState<string>("");
    const currentPhaseRef = useRef("");
    useEffect(() => { currentPhaseRef.current = currentPhase; }, [currentPhase]);

    // page setup
    const [howToPlayOpen, setHowToPlayOpen] = useState(false);
    const [board, setBoard] = useState<WordCard[]>([]);
    const [gameId, setGameId] = useState<number | null>(null);
    const previousGameIdRef = useRef<number | null>(null);

    // players
    const [players, setPlayers] = useState<User[]>([]);
    const [blueSpymaster, setBlueSpymaster] = useState<User | null>(null);
    const [redSpymaster, setRedSpymaster] = useState<User | null>(null);
    const [blueSpies, setBlueSpies] = useState<User[]>([]);
    const [redSpies, setRedSpies] = useState<User[]>([]);
    const [role, setRole] = useState<User["role"] | null>(null);
    const [loadingRole, setLoadingRole] = useState(true);

    // game flow
    const [currentTurn, setCurrentTurn] = useState<"red" | "blue">("red");
    const currentTurnRef = useRef<"red" | "blue">("red");
    useEffect(() => { currentTurnRef.current = currentTurn; }, [currentTurn]);
    const [clueWord, setClueWord] = useState("");
    const [clueCount, setClueCount] = useState<number>(1);
    const [currentClue, setCurrentClue] = useState<{ word: string; count: number } | null>(null);
    const [cluePublished, setCluePublished] = useState(false);
    const [clueHistory, setClueHistory] = useState<{ word: string; count: number; team: "red" | "blue" }[]>([]);
    
    const [finished, setFinished] = useState(false);
    const [isRestarting, setIsRestarting] = useState(false);
    const [winningTeam, setWinningTeam] = useState<string | null>(null);

    // penalty
    const [penaltyPickMode, setPenaltyPickMode] = useState(false);
    const [penaltyCardPicked, setPenaltyCardPicked] = useState<WordCard | null>(null);

    const [reportConfirmOpen, setReportConfirmOpen] = useState(false);
    const [clueReviewOpen, setClueReviewOpen] = useState(false);
    const [penaltyConfirmOpen, setPenaltyConfirmOpen] = useState(false);

    const storedPlayerId = typeof window !== "undefined" ? sessionStorage.getItem(`playerId_${lobbyCode}`) : null;
    const currentPlayer = players.find((p) => String(p.id) == String(storedPlayerId)) ?? null;

    const teamCardType = currentTurn == "red" ? "AGENTRED" : "AGENTBLUE";
    const remainingTeamCards = board.filter((c) => c.cardType == teamCardType && !c.revealed).length;

    const opposingSpymaster = players.find((p) => p.team !== currentTurn.toUpperCase() && p.role == "SPYMASTER") ?? null;

    const [dictionaryOpen, setDictionaryOpen] = useState(false);
    const [dictionarySearch, setDictionarySearch] = useState("");
    const [endTurnConfirmOpen, setEndTurnConfirmOpen] = useState(false);

    const [colorOverlayActive, setColorOverlayActive] = useState(false);

    const isMyTurn = currentPlayer?.team?.toLowerCase() == currentTurn.toLowerCase();
    const canEndTurn = isMyTurn && role !== "SPYMASTER" && cluePublished;

    const isOpposingSpymaster = opposingSpymaster != null && String(opposingSpymaster.id) == String(storedPlayerId);
    // const isOpposingSpymaster = true;

    const [dictionaryResult, setDictionaryResult] = useState<{ word: string; meanings: string[] } | null>(null);
    const [dictionaryResultOpen, setDictionaryResultOpen] = useState(false);
    const [dictionaryLoading, setDictionaryLoading] = useState(false);

    const handleDictionarySearch = async () => {
        if (!dictionarySearch.trim()) return;

        setDictionaryLoading(true);

        try {
            const response = await fetch(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${dictionarySearch.trim()}`
            );

            if (!response.ok) {
                message.error("Word not found.");
                setDictionaryLoading(false);
                return;
            }

            const data = await response.json();
            const meanings = data[0].meanings.map(
                (m: { partOfSpeech: string; definitions: { definition: string }[] }) =>
                    `${m.partOfSpeech}: ${m.definitions[0].definition}`
            );

            setDictionaryResult({ word: dictionarySearch.trim(), meanings });
            setDictionaryOpen(false);        // close input modal
            setDictionaryResultOpen(true);   // open result modal
        } catch {
            message.error("Failed to look up word.");
        } finally {
            setDictionaryLoading(false);
        }
    };

    // fetch players as a helper function
    const fetchPlayers = async () => {
      try {
        const lobbyData = await apiService.get<{ players: User[] }>(`/api/lobbies/${lobbyCode}`);
        const data = lobbyData.players || [];
        setPlayers(data);

        setBlueSpymaster(
          data.find((player) => player.role === "SPYMASTER" && player.team === "BLUE") ?? null
        );
        setRedSpymaster(
          data.find((player) => player.role === "SPYMASTER" && player.team === "RED") ?? null
        );
        setBlueSpies(
          data.filter((player) => player.role === "SPY" && player.team === "BLUE")
        );
        setRedSpies(
          data.filter((player) => player.role === "SPY" && player.team === "RED")
        );

      } catch {
        console.error("Failed to fetch players!");
      }
    };

    const fetchBoard = async () => {
        try {
            const boardData = await apiService.get<{
                id: number;
                cards: WordCard[];
                currentTurn: "RED" | "BLUE";
                currentPhase: string;
                clueHistory: { word: string; count: number; team: "red" | "blue" }[];
            }>(
                `/api/games/${lobbyCode}/board?role=${role === "SPYMASTER" ? "SPYMASTER" : "SPY"}`
            );
            setGameId(boardData.id);
            setBoard(boardData.cards);
            setCurrentPhase(boardData.currentPhase);
            setCurrentTurn(boardData.currentTurn === "RED" ? "red" : "blue");
            setClueHistory(boardData.clueHistory ?? []);
        } catch (error) {
            console.error("Failed to fetch board!");
        }
    };

    // fetch player and board on startup
    useEffect(() => {
        if (!lobbyCode) return;
        fetchPlayers();
    }, [apiService, lobbyCode]);

    useEffect(() => {
        if (!lobbyCode || !role) return;
        fetchBoard();
    }, [lobbyCode, role]);


    // fetch user role
    useEffect(() => {
        if (!lobbyCode || players.length === 0) return;

        const storedPlayerId = sessionStorage.getItem(`playerId_${lobbyCode}`);

        if (!storedPlayerId) {
            setLoadingRole(false);
            return;
        }

        const found = players.find((p) => String(p.id) === String(storedPlayerId));

        if (found) {
            setRole(found.role);
        }

        setLoadingRole(false);
    }, [players, lobbyCode]);

    // Sometimes turn doesnt get updated in time:
    useEffect(() => {
        currentTurnRef.current = currentTurn;
    }, [currentTurn]);

    // For game restarting
    useEffect(() => {
        if (gameId == null) return;

        const previousGameId = previousGameIdRef.current;

        if (previousGameId == null) {
            previousGameIdRef.current = gameId;
            return;
        }

        if (previousGameId !== gameId) {
            console.log("New game instance detected:", gameId);

            setFinished(false);
            setCurrentClue(null);
            setCluePublished(false);
            setPenaltyPickMode(false);
            setPenaltyCardPicked(null);
            setClueWord("");
            setClueCount(1);
            setClueHistory([]);
        }

        previousGameIdRef.current = gameId;
    }, [gameId]);

    // subscribe to game websocket
    useEffect(() => {
        if (!lobbyCode) return;
        if (!role || role === "NONE") return;
        if (socketRef.current) return; 

        const socket = createGameSocket(String(lobbyCode), role, (event) => {
            switch (event.type) {
                case "Clue":
                    setCurrentPhase(event.board.currentPhase);
                    setCurrentClue({ word: event.board.clueWord ?? "", count: event.board.clueCount });
                    setClueHistory(prev => [{ word: event.board.clueWord ?? "", count: event.board.clueCount, team: currentTurnRef.current }, ...prev]);
                    setCluePublished(true);
                    setBoard(event.board.cards);
                    setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
                    break;
                case "Guess": 
                    setBoard(event.board.cards);
                    setCurrentPhase(event.board.currentPhase);
                    setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
                    break;
                case "ClueReported":
                    setClueReviewOpen(true);
                    break;
                case "ClueApproved":
                    setClueReviewOpen(false);
                    message.success("Clue approved!");
                    break;
                case "ClueRuledInvalid":
                    setClueReviewOpen(false);
                    setClueHistory(prev => prev.slice(1));
                    setCurrentClue(null);
                    setCluePublished(false);
                    setPenaltyPickMode(true);
                    message.warning("Clue ruled invalid!");
                    break;
                case "TurnChanged":
                    setCurrentPhase(event.board.currentPhase);
                    const newTurn = event.board.currentTurn === "RED" ? "red" : "blue";
                    setCurrentTurn(newTurn);

                    setCluePublished(false);
                    setCurrentClue(null);
                    setClueWord("");
                    setBoard(event.board.cards);
                    break;
                case "GameOver":
                    fetchBoard();
                    setFinished(true);
                    fetchGameStatistics();
                    break;
                case "ReturningToLobby":
                    setWinningTeam(null);
                    socketRef.current?.disconnect();
                    router.push(`/${lobbyCode}`);
                    break;
                case "GameRestarting":
                    setWinningTeam(null);
                    setIsRestarting(false);
                    if (event.board) {
                        setGameId(event.board.id);
                        setBoard(event.board.cards);
                        setCurrentPhase(event.board.currentPhase);
                        setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
                    }
                    break;
                default: break;
            }
        },
        // reconnect handler
        () => {
            console.log("Reconnected → refetching state");
            fetchBoard();
            fetchPlayers();
        }
    );

        socketRef.current = socket;
        socket.connect();

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [lobbyCode, role]);

    // publish clue
    const handleSendClue = () => {
        if (cluePublished) {
            message.error("Clue already published.");
            return;
        }

        const trimmed = clueWord.trim();

        if (!trimmed) {
            message.error("Please enter a clue word.");
            return;
        }
        if (/\s/.test(trimmed)) {
            message.error("Clue must be a single word (no spaces).");
            return;
        }
        if (/[0-9]/.test(trimmed)) {
            message.error("Clue may not contain numbers.");
            return;
        }
        if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?`~]/.test(trimmed)) {
            message.error("Clue may not contain special characters.");
            return;
        }

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

    const getCardClass = (card: WordCard) => {
        if (!card.revealed) {
            if (penaltyPickMode) {
                const isMyTeamCard =
                    (currentTurn == "red" && card.cardType == "AGENTRED") ||
                    (currentTurn == "blue" && card.cardType == "AGENTBLUE");

                return isMyTeamCard
                    ? `${styles.card} ${styles.clickableCard}`
                    : `${styles.card}`;
            }
            if (colorOverlayActive) {
                switch (card.cardType) {
                    case "AGENTRED": return `${styles.card} ${styles.clickableCard} ${styles.cardOverlayRed}`;
                    case "AGENTBLUE": return `${styles.card} ${styles.clickableCard} ${styles.cardOverlayBlue}`;
                    case "CIVILIAN": return `${styles.card} ${styles.clickableCard} ${styles.cardOverlayCivilian}`;
                    case "ASSASSIN": return `${styles.card} ${styles.clickableCard} ${styles.cardOverlayAssassin}`;
                }
            }

            return `${styles.card} ${styles.clickableCard}`;
        }

        switch (card.cardType) {
            case "CIVILIAN":
                return `${styles.card} ${styles.cardCivilian}`;
            case "AGENTBLUE":
                return `${styles.card} ${styles.cardBlueAgent}`;
            case "AGENTRED":
                return `${styles.card} ${styles.cardRedAgent}`;
            case "ASSASSIN":
                return `${styles.card} ${styles.cardAssassin}`;
            default:
                return styles.card;
        }
    };

    const handleCardClick = (card: WordCard) => {
        if (card.revealed || !currentPlayer) return;

        if (penaltyPickMode) {
            handlePenaltyCardClick(card);
            return;
        }

        if (!currentPlayer) return;
        if (currentPlayer.role == "SPYMASTER") return message.error("You are not a spy!");
        if (currentTurnRef.current.toUpperCase() !== currentPlayer.team) return message.error("It is not your turn yet!");

        const guessEvent: GuessEvent = {
            type: "Guess",
            timeStamp: new Date().toISOString(),
            player: currentPlayer,
            description: `${currentPlayer.username} guessed ${card.word}`,
            guessedCard: card,
        };

        if (socketRef.current) {
            socketRef.current.sendGuess(guessEvent);
        }
    };

    const teamClass = currentTurn === "red" ? styles.teamRed : styles.blueTeam;

    const handleEndTurnConfirm = () => {
        if (!socketRef.current || !currentPlayer) return;

        const nextTeam = currentTurn == "red" ? "blue" : "red";

        socketRef.current.sendTurnChange({
            type: "TurnChanged",
            timeStamp: new Date().toISOString(),
            player: currentPlayer,
            description: `${currentPlayer.username} ended the turn.`,
            team: nextTeam,
        });

        setEndTurnConfirmOpen(false);
        message.success(`Turn passed to ${nextTeam.toUpperCase()} team`);
    };


    // report flow

    const handleReportClick = () => {
        if (cluePublished) setReportConfirmOpen(true);
    };

    const handleReportConfirm = () => {
        setReportConfirmOpen(false);
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


    // penalty flow

    const handlePenaltyCardClick = (card: WordCard) => {
        if (card.revealed) return;

        const isMyTeamCard =
            (currentTurn == "red" && card.cardType == "AGENTRED") ||
            (currentTurn == "blue" && card.cardType == "AGENTBLUE");

        if (!isMyTeamCard) {
            message.error(`You must cover one of your own (${currentTurn}) cards.`);
            return;
        }

        setPenaltyCardPicked(card);
        setPenaltyConfirmOpen(true);
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
        setPenaltyConfirmOpen(false);
    };


    // post game screen
    const isHost = currentPlayer?.isHost === true;
    const handleRestartGame = async () => {
      try{
        console.log("Starting new game (restart)!");
        setIsRestarting(true);
        await apiService.post(`/api/games/${lobbyCode}/restart`, {});
      }
      catch (error) {message.error("Failed to restart game.")}
    }

    const handleBackToLobby = async () => {
      try{
        await apiService.post(`/api/games/${lobbyCode}/backToLobby`, {});
      }
      catch (error) {message.error("Failed to restart game.")}
    }

    const fetchGameStatistics = async () => {
    try {
        const stats = await apiService.get<{ winningTeam: string }>(`/api/games/${lobbyCode}/statistics`);
        setWinningTeam(stats.winningTeam);
    } catch (error) {
        console.error("Failed to fetch game statistics!");
        setWinningTeam(null);
    }
};


    return (
        <ConfigProvider
            theme={{
                components: {
                    Input: { colorText: "#000", colorBgContainer: "#fff" },
                    InputNumber: { colorText: "#000", colorBgContainer: "#fff" },
                    Modal: { colorText: "#000", colorBgContainer: "#fff" },
                },
            }}>

            <PlayerTable
                currentTurn={currentTurn}
                blueSpymaster={blueSpymaster}
                redSpymaster={redSpymaster}
                blueSpies={blueSpies}
                redSpies={redSpies}
            />

            <div className={`${styles.page} ${teamClass}`}>

                {/*CLUE HISTORY SIDEBAR*/}
                <ClueHistory clueHistory={clueHistory} />

                {/*BOARD*/}
                <div className={styles.board}>
                    {board.map((card, index) => (
                        <div
                            key={index}
                            className={getCardClass(card)}
                            onClick={() => handleCardClick(card)}
                        >
                            <span className={styles.cardWord}>{card.word}</span>
                        </div>
                    ))}
                </div>


                {/*CLUE INPUT --> comment out role == "spymaster" to see the spy view*/}
                {role == "SPYMASTER" && isMyTurn && !penaltyPickMode && currentPhase === "SPYMASTER_TURN" && (
                    <ClueInput
                        clueWord={clueWord}
                        setClueWord={setClueWord}
                        clueCount={clueCount}
                        setClueCount={setClueCount}
                        onSend={handleSendClue}
                        disabled={cluePublished}
                        remainingTeamCards={remainingTeamCards}
                    />
                )}
            </div>

            
            {/*VARIOUS BUTTONS*/}
            <div>
                <Button
                    type="primary"
                    disabled={!cluePublished}
                    onClick={handleReportClick}
                    style={{
                        position: "absolute",
                        width: 125,
                        bottom: 130,
                        right: 20,
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px"
                    }}                >
                    Report Clue
                </Button>
            </div>

            {currentPlayer?.role === "SPYMASTER" && (
                <Button
                    type={colorOverlayActive ? "default" : "primary"}
                    onClick={() => setColorOverlayActive(prev => !prev)}
                    style={{
                        position: "absolute",
                        width: 125,
                        bottom: 185,
                        right: 20,
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px"
                    }}
                >
                    {colorOverlayActive ? "Hide Key" : "Show Key"}
                </Button>
            )}

            <div style={{
                position: "absolute",
                bottom: 75,
                right: 20,
                display: "flex",
                flexDirection: "column",
                gap: "15px"
            }}>

                <Modal
                    title="Confirm End Turn"
                    open={endTurnConfirmOpen}
                    onOk={handleEndTurnConfirm}
                    onCancel={() => setEndTurnConfirmOpen(false)}
                    closable={false}
                    okText="End Turn"
                    cancelText="Cancel"
                >
                    <p>Are you sure you want to end your team&apos;s turn?</p>
                </Modal>
                {role == "SPY" && (
                    <Button
                        type="primary"
                        onClick={() => setEndTurnConfirmOpen(true)}
                        disabled={!canEndTurn}
                        style={{ bottom: 55, width: 125, height: 40, padding: "0 20px", borderRadius: 8 }}
                    >
                        End Turn
                    </Button>
                )
                }
                {/* Dictionary Input Modal */}
                <Modal
                    title="Dictionary"
                    open={dictionaryOpen}
                    onCancel={() => {
                        setDictionaryOpen(false);
                        setDictionarySearch("");
                    }}
                    footer={null}
                >
                    <div style={{ padding: "10px 0" }}>
                        <p style={{ marginBottom: "8px", fontWeight: 500 }}>Search for a word:</p>
                        <Input
                            placeholder="Enter word..."
                            value={dictionarySearch}
                            onChange={(e) => setDictionarySearch(e.target.value)}
                            onPressEnter={handleDictionarySearch}
                            //onPressEnter={() => {/*dictionary logic here --> best if one can only search for words currently on the board (display multiple manings if there is more than one)*/ }}
                        />
                        <p style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}>
                            Press Enter to search.
                        </p>
                    </div>
                </Modal> 
                <Button
                    type="primary"
                    onClick={() => setDictionaryOpen(true)}
                    loading={dictionaryLoading}
                    style={{ width: 125, height: 40, padding: "0 20px", borderRadius: 8 }}
                >
                    Dictionary
                </Button>

                {/* Dictionary Result Modal */}
                <Modal
                    title={`Definition: ${dictionaryResult?.word}`}
                    open={dictionaryResultOpen}
                    onCancel={() => {
                        setDictionaryResultOpen(false);
                        setDictionaryResult(null);
                        setDictionarySearch("");
                    }}
                    footer={null}
                >
                    {dictionaryResult?.meanings.map((meaning, index) => (
                        <p key={index} style={{ marginBottom: 8 }}>{meaning}</p>
                    ))}
                </Modal>


            </div>
            <div style={{ position: "absolute", bottom: 20, right: 20 }}>
                <Button
                    type="primary"
                    style={{ width: 125 }}
                    onClick={() => setHowToPlayOpen(true)}
                >
                    How To Play
                </Button>
            </div>
            <HowToPlayModal
                open={howToPlayOpen}
                onClose={() => setHowToPlayOpen(false)}
            />

            {/*REPORT CONFIRMATION*/}
            <ReportConfirmationModal
                reportConfirmOpen={reportConfirmOpen}
                onCancel={() => setReportConfirmOpen(false)}
                onConfirm={handleReportConfirm}
                currentClue={currentClue}
            />

            {/*REVIEW CLUE (OPPOSING SPYMASTER)*/}
            <ClueReviewModal
                clueReviewOpen={clueReviewOpen}
                isOpposingSpymaster={isOpposingSpymaster}
                currentClue={currentClue}
                onApprove={handleClueApproved}
                onReject={handleClueRuledInvalid}
                currentTurn={currentTurn}
            />

            {/*CONFIRM PENALTY CARD REVEAL*/}
            <PenaltyConfirmModal
                open={penaltyConfirmOpen}
                penaltyCardPicked={penaltyCardPicked}
                onConfirm={handlePenaltyConfirm} // Map your handler to onConfirm
                setPenaltyConfirmOpen={setPenaltyConfirmOpen}
                setPenaltyCardPicked={setPenaltyCardPicked}
            />
          {(finished) && (  // removed && is host --> double check?
            <div className={styles.finishedBackdrop}>
                <div className={styles.finishedBox}>
                    <h2 className={styles.finishedTitle}>Game Over</h2>
                        <p className={styles.finishedText}>
                            {winningTeam ? `Team ${winningTeam} has won the game!` : "The game has ended."}
                        </p>
                    {isHost ? (
                        <div className={styles.finishedButtons}>
                            <Button onClick={handleRestartGame} loading={isRestarting} disabled={isRestarting}>
                                {isRestarting ? "Restarting..." : "Restart"}
                            </Button>
                            <Button onClick={handleBackToLobby} disabled={isRestarting}>
                                Return to Lobby
                            </Button>
                        </div>
                    ):(<p className={styles.finishedText}>Waiting for the host to choose what happens next.</p>)}
                </div>
            </div>
        )}
        </ConfigProvider>
    );
}
