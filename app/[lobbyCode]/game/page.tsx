"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { WordCard } from "@/types/wordCard";
import { GuessEvent, ClueEvent } from "@/types/gameEvent";
import { createGameSocket } from "@/utils/gameWebsocket";
import styles from "@/styles/game.module.css";
import { Button, message, ConfigProvider, Modal, Input } from "antd";
import HowToPlayModal from "@/components/HowToPlayModal";
import ClueHistory from "@/components/ClueHistory";
import ClueInput from "@/components/ClueInputs";
import ReportConfirmationModal from "@/components/ReportConfirmationModal";
import ClueReviewModal from "@/components/ReviewClueModal";
import PenaltyConfirmModal from "@/components/ConfirmPenaltyCardRevealModal";
import PlayerList from "@/components/PlayerTable";

export default function GamePage() {
    const apiService = useApi();
    const { lobbyCode } = useParams();
    const socketRef = useRef<ReturnType<typeof createGameSocket> | null>(null);

    // page setup
    const [howToPlayOpen, setHowToPlayOpen] = useState(false);
    const [board, setBoard] = useState<WordCard[]>([]);

    // players
    const [players, setPlayers] = useState<User[]>([]);
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

    // penalty
    const [penaltyPickMode, setPenaltyPickMode] = useState(false);
    const [penaltyCardPicked, setPenaltyCardPicked] = useState<WordCard | null>(null);

    const [reportConfirmOpen, setReportConfirmOpen] = useState(false);
    const [clueReviewOpen, setClueReviewOpen] = useState(false);
    const [penaltyConfirmOpen, setPenaltyConfirmOpen] = useState(false);

    const storedPlayerId = typeof window !== "undefined" ? localStorage.getItem(`playerId_${lobbyCode}`) : null;
    const currentPlayer = players.find((p) => String(p.id) == String(storedPlayerId)) ?? null;

    const teamCardType = currentTurn == "red" ? "AGENTRED" : "AGENTBLUE";
    const remainingTeamCards = board.filter((c) => c.cardType == teamCardType && !c.revealed).length;

    const opposingSpymaster = players.find((p) => p.team !== currentTurn.toUpperCase() && p.role == "SPYMASTER") ?? null;

    const [dictionaryOpen, setDictionaryOpen] = useState(false);
    const [dictionarySearch, setDictionarySearch] = useState("");
    const [endTurnConfirmOpen, setEndTurnConfirmOpen] = useState(false);

    const [colorOverlayActive, setColorOverlayActive] = useState(false);

    const isMyTurn = currentPlayer?.team?.toLowerCase() == currentTurn.toLowerCase();
    const canEndTurn = isMyTurn && role !== "SPYMASTER";

    const isOpposingSpymaster = opposingSpymaster != null && String(opposingSpymaster.id) == String(storedPlayerId);
    // const isOpposingSpymaster = true;

    // fetch players as a helper function
    const fetchPlayers = async () => {
        try {
            const lobbyData = await apiService.get<{ players: User[] }>(`/api/lobbies/${lobbyCode}`);

            setPlayers(lobbyData.players || []);
        } catch (error) {
            console.error("Failed to fetch players!");
        }
    };

    const fetchBoard = async () => {
        try {
            const boardData = await apiService.get<{ cards: WordCard[]; currentTurn: "RED" | "BLUE" }>(
                `/api/games/${lobbyCode}/board?role=${role === "SPYMASTER" ? "SPYMASTER" : "SPY"}`
            );
            setBoard(boardData.cards);
            setCurrentTurn(boardData.currentTurn === "RED" ? "red" : "blue");
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

        const storedPlayerId = localStorage.getItem(`playerId_${lobbyCode}`);

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


    // subscribe to game websocket
    useEffect(() => {
        if (!lobbyCode) return;
        if (!role || role === "NONE") return;
        if (socketRef.current) return; 

        const socket = createGameSocket(String(lobbyCode), role, (event) => {
            switch (event.type) {
                case "Clue":
                    setCurrentClue({ word: event.board.clueWord ?? "", count: event.board.clueCount });
                    setClueHistory(prev => [{ word: event.board.clueWord ?? "", count: event.board.clueCount, team: currentTurnRef.current }, ...prev]);
                    setCluePublished(true);
                    break;
                case "Guess": { fetchBoard(); break; }
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
                    setCurrentTurn(event.board.currentTurn === "RED" ? "red" : "blue");
                    setCluePublished(false);
                    setCurrentClue(null);
                    setClueWord("");
                    fetchBoard();
                    break;
                default: break;
            }
        });

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
        if (currentTurn.toUpperCase() != currentPlayer.team) return message.error("It is not your turn yet!");

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


    return (
        <ConfigProvider
            theme={{
                components: {
                    Input: { colorText: "#000", colorBgContainer: "#fff" },
                    InputNumber: { colorText: "#000", colorBgContainer: "#fff" },
                    Modal: { colorText: "#000", colorBgContainer: "#fff" },
                },
            }}>

            <PlayerList
                currentTurn={currentTurn}
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
                {role == "SPYMASTER" && isMyTurn && !penaltyPickMode && (
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
                <Modal
                    title="Dictionary"
                    open={dictionaryOpen}
                    onCancel={() => setDictionaryOpen(false)}
                    footer={null}
                >
                    <div style={{ padding: "10px 0" }}>
                        <p style={{ marginBottom: "8px", fontWeight: 500 }}>Search for a word:</p>
                        <Input
                            placeholder="Enter word..."
                            value={dictionarySearch}
                            onChange={(e) => setDictionarySearch(e.target.value)}
                            onPressEnter={() => {/*dictionary logic here --> best if one can only search for words currently on the board (display multiple manings if there is more than one)*/ }}
                        />
                        <p style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}>
                            Press Enter to search.
                        </p>
                    </div>
                </Modal>
                <Button
                    type="primary"
                    onClick={() => setDictionaryOpen(true)}
                    style={{ width: 125, height: 40, padding: "0 20px", borderRadius: 8 }}
                >
                    Dictionary
                </Button>


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
        </ConfigProvider>
    );
}
