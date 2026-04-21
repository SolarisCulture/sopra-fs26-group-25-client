interface Props {
    clueHistory: { word: string; count: number; team: "red" | "blue" }[];
}

export default function ClueHistory({ clueHistory }: Props) {
    return (
        <div style={{
            position: "absolute",
            left: "2vw",
            top: "24px",
            width: "18vw",
            minWidth: 140,
            maxWidth: 320,

            maxHeight: "70vh",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(12px)",
            borderRadius: 16,
            padding: "1.5vw",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            overflowY: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
        }}>
            <h3 style={{
                fontSize: "clamp(16px, 1.2vw, 22px)",
                fontWeight: 700,
                margin: "0 0 5px 0",
                borderBottom: "1px solid rgba(255,255,255,0.2)",
                paddingBottom: "0.8vw"
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
                        padding: isLatest ? "1.2vw 1vw" : "0.8vw 1vw",
                        borderRadius: 12,
                        background: "rgba(0,0,0,0.25)",
                        borderLeft: `4px solid ${teamColor}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.3vw",
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

    );
}
