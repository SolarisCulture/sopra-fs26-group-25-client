"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { WordCard } from "@/types/wordCard";
import { GameEvent, GuessEvent, ClueEvent, ClueReportedEvent, ClueRulingEvent } from "@/types/gameEvent";
import { createGameSocket } from "@/utils/gameWebsocket";
import styles from "@/styles/game.module.css";
import { Input, InputNumber, Button, message, ConfigProvider, Modal } from "antd";
import HowToPlayModal from "@/components/HowToPlayModal";
import ClueHistory from "@/components/ClueHistory";
import ClueInput from "@/components/ClueInputs";
import ReportConfirmationModal from "@/components/ReportConfirmationModal";
import ClueReviewModal from "@/components/ReviewClueModal";
import PenaltyConfirmModal from "@/components/ConfirmPenaltyCardRevealModal";

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

    const opposingSpymaster = players.find((p) => p.team !== currentTurn && p.role == "spymaster") ?? null;

    const isOpposingSpymaster = opposingSpymaster != null && String(opposingSpymaster.id) == String(storedPlayerId);
    // const isOpposingSpymaster = true;


    // fetch players as a helper function
    const fetchPlayers = async () => {
        try {
            const players = await apiService.get<User[]>(`/api/lobbies/${lobbyCode}/players`);
            setPlayers(players);
        } catch (error) {
            console.error("Failed to fetch players!");
        }
    };

    const fetchBoard = async () => {
        try {
            const boardData = await apiService.get<{ cards: WordCard[]; currentTurn: "RED" | "BLUE" }>(
                `/api/games/${lobbyCode}/board?role=${role === "spymaster" ? "SPYMASTER" : "SPY"}`
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
        if (!lobbyCode) return;

        const storedPlayerId = localStorage.getItem(`playerId_${lobbyCode}`);

        if (!storedPlayerId || players.length == 0) {
            setLoadingRole(false);
            return;
        }
        const found = players.find((p) => String(p.id) == String(storedPlayerId));
        if (found) setRole(found.role);
        setLoadingRole(false);
    }, [players, lobbyCode]);


    // subscribe to game websocket
    useEffect(() => {
        if (!lobbyCode) return;

        const socket = createGameSocket(String(lobbyCode), (event) => {
            switch (event.type) {
                case "Clue":
                    setCurrentClue({ word: event.word, count: event.count });
                    setClueHistory(prev => [{ word: event.word, count: event.count, team: currentTurnRef.current }, ...prev]);
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
                    setCurrentTurn(event.team);
                    setCluePublished(false);
                    setCurrentClue(null);
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
    }, [lobbyCode]);


    // mock board
    // useEffect(() => {
    //     const cards: WordCard[] = [
    //         { word: "Apple", cardType: "CIVILIAN", revealed: false },
    //         { word: "River", cardType: "AGENTBLUE", revealed: true },
    //         { word: "Castle", cardType: "AGENTRED", revealed: false },
    //         { word: "Moon", cardType: "ASSASSIN", revealed: true },
    //         { word: "Tiger", cardType: "CIVILIAN", revealed: false },
    //         { word: "Glass", cardType: "AGENTBLUE", revealed: false },
    //         { word: "Train", cardType: "AGENTRED", revealed: true },
    //         { word: "Cloud", cardType: "CIVILIAN", revealed: false },
    //         { word: "Chair", cardType: "AGENTBLUE", revealed: false },
    //         { word: "Book", cardType: "AGENTRED", revealed: false },
    //         { word: "Bridge", cardType: "CIVILIAN", revealed: false },
    //         { word: "Whale", cardType: "AGENTBLUE", revealed: false },
    //         { word: "Snow", cardType: "AGENTRED", revealed: false },
    //         { word: "Clock", cardType: "CIVILIAN", revealed: true },
    //         { word: "Piano", cardType: "AGENTBLUE", revealed: false },
    //         { word: "Bread", cardType: "AGENTRED", revealed: false },
    //         { word: "Forest", cardType: "CIVILIAN", revealed: false },
    //         { word: "Bottle", cardType: "AGENTBLUE", revealed: false },
    //         { word: "Star", cardType: "AGENTRED", revealed: false },
    //         { word: "Window", cardType: "CIVILIAN", revealed: false },
    //         { word: "Rocket", cardType: "AGENTBLUE", revealed: true },
    //         { word: "Lamp", cardType: "AGENTRED", revealed: false },
    //         { word: "Beach", cardType: "CIVILIAN", revealed: false },
    //         { word: "Ring", cardType: "AGENTBLUE", revealed: false },
    //         { word: "Tower", cardType: "AGENTRED", revealed: false },
    //     ];
    //     setBoard(cards);
    //     const MOCK_ID = "mock-player-1";
    //     localStorage.setItem(`playerId_${lobbyCode}`, MOCK_ID);
    //     setPlayers([
    //         {
    //             id: "mock-player-1", username: "Alice", team: "red", role: "spymaster",
    //             token: null
    //         },
    //         {
    //             id: "mock-player-2", username: "Bob", team: "blue", role: "spymaster",
    //             token: null
    //         },
    //     ]);
    // }, []);

    const handleToggleTurn = () => {
        setCurrentTurn((prev) => (prev === "red" ? "blue" : "red"));
        setCluePublished(false);
        setCurrentClue(null);
    };

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

    const handleCardClick = (card: WordCard, index: number) => {
        if (card.revealed) return;

        if (penaltyPickMode) {
            handlePenaltyCardClick(card);
            return;
        }

        if (!currentPlayer) return;

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
            <div className={`${styles.page} ${teamClass}`}>

                {/*CLUE HISTORY SIDEBAR*/}
                <ClueHistory clueHistory={clueHistory} />

                {/*BOARD*/}
                <div className={styles.board}>
                    {board.map((card, index) => (
                        <div
                            key={index}
                            className={getCardClass(card)}
                            onClick={() => handleCardClick(card, index)}
                        >
                            <span className={styles.cardWord}>{card.word}</span>
                        </div>
                    ))}
                </div>


                {/*CLUE INPUT --> comment out role == "spymaster" to see the spy view*/}
                {role == "spymaster" && !penaltyPickMode && (
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

                <button onClick={handleToggleTurn}>Change Turn (Temporary Button to show feature)</button>
            </div>

            {/*REPORT CLUE BUTTON*/}
            <div style={{ position: "absolute", bottom: 75, right: 20 }}>
                <Button
                    type="primary"
                    disabled={!cluePublished}
                    onClick={handleReportClick}
                    style={{ width: 125, height: 40, padding: "0 20px", borderRadius: 8, fontWeight: 600 }}
                >
                    Report Clue
                </Button>
            </div>

            {/*HOW TO PLAY*/}
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
