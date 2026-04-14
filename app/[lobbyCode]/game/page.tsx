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
            setPlayers(data);
        } catch (error) {
            console.error("Failed to fetch players!");
        }
    };

    const fetchBoard = async () => {
        try {
            const boardData = await apiService.get<{ cards: WordCard[]; currentTurn: "RED" | "BLUE" }>(
                `/api/games/${lobbyCode}/board?role=${role === "spymaster" ? "SPYMASTER" : "SPY"}`
            );
            setBoard(data.cards);
            setCurrentTurn(data.currentTurn === "RED" ? "red" : "blue");
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
                <div style={{
                    position: "absolute",
                    left: 20,
                    top: 100,
                    width: 320,
                    maxHeight: "70vh",
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(12px)",
                    borderRadius: 16,
                    padding: 20,
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "#fff",
                    overflowY: "auto",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}>
                    <h3 style={{
                        fontSize: 22,
                        fontWeight: 700,
                        margin: "0 0 5px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.2)",
                        paddingBottom: 10
                    }}>
                        Clue History
                    </h3>

                    {clueHistory.length == 0 && (
                        <span style={{
                            opacity: 0.5,
                            fontStyle: "italic",
                            textAlign: "center",
                            padding: "20px 0"
                        }}>
                            Waiting for clues...
                        </span>
                    )}

                    {clueHistory.map((h, i) => {
                        const isLatest = i == 0;
                        const teamColor = h.team == "red" ? "#ff4d4f" : "#1890ff";

                        return (
                            <div key={i} style={{
                                padding: isLatest ? "20px 14px 14px" : "12px 14px",
                                borderRadius: 12,
                                background: "rgba(0,0,0,0.25)",
                                borderLeft: `4px solid ${teamColor}`,
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                                position: "relative",
                                marginTop: isLatest ? 5 : 0,
                            }}>
                                {isLatest && (
                                    <span style={{
                                        position: "absolute",
                                        top: -10,
                                        right: 10,
                                        background: teamColor,
                                        color: "#fff",
                                        fontSize: 10,
                                        padding: "2px 10px",
                                        borderRadius: 10,
                                        fontWeight: 800,
                                        letterSpacing: "0.5px",
                                    }}>
                                        LATEST CLUE
                                    </span>
                                )}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    gap: 10
                                }}>
                                    <span style={{
                                        fontWeight: 800,
                                        fontSize: isLatest ? 18 : 16,
                                        color: "#fff",
                                        flex: 1
                                    }}>
                                        {h.word}
                                    </span>
                                    <span style={{
                                        background: "rgba(255,255,255,0.9)",
                                        color: "#000",
                                        padding: "2px 8px",
                                        borderRadius: 6,
                                        fontSize: 14,
                                        fontWeight: 900,
                                        minWidth: 28,
                                        textAlign: "center",
                                    }}>
                                        {h.count}
                                    </span>
                                </div>
                                <span style={{
                                    fontSize: 10,
                                    opacity: 0.6,
                                    fontWeight: 700,
                                    textTransform: "uppercase"
                                }}>
                                    Team {h.team}
                                </span>
                            </div>
                        );
                    })}
                </div>

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
                    <div style={{
                        position: "absolute",
                        bottom: 40,
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        padding: "16px 20px",
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(8px)",
                        borderRadius: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}>
                        <Input
                            placeholder="Clue word"
                            value={clueWord}
                            onChange={(e) => setClueWord(e.target.value)}
                            onPressEnter={handleSendClue}
                            disabled={cluePublished}
                            style={{ width: 180, borderRadius: 8 }}
                        />
                        <InputNumber
                            min={0}
                            max={remainingTeamCards + 1}
                            value={clueCount}
                            onChange={(val) => setClueCount(val ?? 1)}
                            formatter={(value) => Number(value) > remainingTeamCards ? "∞" : String(value)}
                            parser={(value) => value == "∞" ? remainingTeamCards + 1 : parseInt(value || "1", 10)}
                            disabled={cluePublished}
                            style={{ width: 70, borderRadius: 8 }}
                        />
                        <Button
                            type="primary"
                            onClick={handleSendClue}
                            style={{ height: 40, padding: "0 20px", borderRadius: 8, fontWeight: 600 }}
                        >
                            Publish Clue
                        </Button>
                    </div>
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
            <Modal
                title={<div style={{ color: "#000", textAlign: "center", fontSize: 18, fontWeight: 700 }}>Report Clue</div>}
                open={reportConfirmOpen}
                onCancel={() => setReportConfirmOpen(false)}
                footer={null}
                width={480}
                centered
            >
                <div style={{ padding: "12px 0 8px", color: "#000" }}>
                    <p style={{ fontSize: 15, marginBottom: 20 }}>
                        Are you sure you want to report the clue <strong>"{currentClue?.word}"</strong>?
                        <br />
                        The opposing spymaster will be asked to rule on its validity.
                    </p>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                        <Button
                            onClick={() => setReportConfirmOpen(false)}
                            style={{ borderRadius: 8, fontWeight: 600 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            danger
                            onClick={handleReportConfirm}
                            style={{ borderRadius: 8, fontWeight: 600 }}
                        >
                            Yes, Report
                        </Button>
                    </div>
                </div>
            </Modal>

            {/*REVIEW CLUE (OPPOSING SPYMASTER)*/}
            <Modal
                title={
                    <div style={{ color: "#000", textAlign: "center", fontSize: 18, fontWeight: 700 }}>
                        {isOpposingSpymaster ? "Review Reported Clue" : "Clue Under Review"}
                    </div>
                }
                open={clueReviewOpen}
                closable={false}
                maskClosable={false}
                footer={null}
                width={520}
                centered
            >
                <div style={{ padding: "12px 0 8px", color: "#000" }}>
                    {isOpposingSpymaster ? (
                        <>
                            <p style={{ fontSize: 15, marginBottom: 6 }}>
                                A clue has been reported. As the opposing spymaster, you must decide:
                            </p>
                            <div
                                style={{
                                    background: "rgba(0,0,0,0.06)",
                                    borderRadius: 8,
                                    padding: "12px 16px",
                                    marginBottom: 20,
                                    textAlign: "center"
                                }}>
                                <span style={{ fontSize: 22, fontWeight: 700 }}>"{currentClue?.word}"</span>
                                <span style={{ fontSize: 16, marginLeft: 8, color: "#555" }}>({currentClue?.count})</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                                <Button
                                    type="primary"
                                    onClick={handleClueApproved}
                                    style={{ borderRadius: 8, fontWeight: 600, minWidth: 130 }}
                                >
                                    Clue is OK
                                </Button>
                                <Button
                                    type="primary"
                                    danger onClick={handleClueRuledInvalid}
                                    style={{ borderRadius: 8, fontWeight: 600, minWidth: 130 }}
                                >
                                    Clue is Invalid
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <p style={{ fontSize: 16, marginBottom: 20 }}>
                                The <strong style={{ color: currentTurn == "red" ? "#1890ff" : "#ff4d4f" }}>
                                    {currentTurn == "red" ? "Blue" : "Red"} Spymaster
                                </strong> is reviewing the clue...
                            </p>
                            <div
                                className={styles.spinner}
                                style={{ margin: "0 auto" }}
                            />
                        </div>
                    )}
                </div>
            </Modal>

            {/*CONFIRM PENALTY CARD REVEAL*/}
            <Modal
                title={<div style={{ color: "#000", textAlign: "center", fontSize: 18, fontWeight: 700 }}>Confirm Free Reveal</div>}
                open={penaltyConfirmOpen}
                onCancel={() => {
                    setPenaltyConfirmOpen(false);
                    setPenaltyCardPicked(null);
                }}
                closable={false}
                footer={null}
                width={420}
                centered
            >
                <div style={{ padding: "12px 0 8px", color: "#000" }}>
                    <p style={{ fontSize: 15, marginBottom: 20 }}>
                        Reveal <strong>"{penaltyCardPicked?.word}"</strong> as your free card? This cannot be undone.
                    </p>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                        <Button
                            onClick={() => {
                                setPenaltyConfirmOpen(false);
                                setPenaltyCardPicked(null);
                            }}
                            style={{ borderRadius: 8, fontWeight: 600 }}
                        >
                            Pick a Different Card
                        </Button>
                        <Button
                            type="primary"
                            onClick={handlePenaltyConfirm}
                            style={{ borderRadius: 8, fontWeight: 600 }}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </Modal>
            <HowToPlayModal
                open={howToPlayOpen}
                onClose={() => setHowToPlayOpen(false)}
            />
        </ConfigProvider>
    );
}
