import { Modal, Button } from "antd";
import styles from "@/styles/game/game.module.css";

interface Props {
    clueReviewOpen: boolean;
    isOpposingSpymaster: boolean;
    currentClue: { word: string; count: number } | null;
    onApprove: () => void;
    onReject: () => void;
    currentTurn: "red" | "blue";
}

export default function ClueReviewModal({ clueReviewOpen, isOpposingSpymaster, currentClue, onApprove, onReject, currentTurn }: Props) {
    return (
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
                            <span style={{ fontSize: 22, fontWeight: 700 }}>&quot;{currentClue?.word}&quot;</span>
                            <span style={{ fontSize: 16, marginLeft: 8, color: "#555" }}>({currentClue?.count})</span>
                        </div>
                        <div style={{display: "flex", justifyContent: "center", gap: 16}}>
                            <Button
                                type="primary"
                                onClick={onApprove}
                                style={{borderRadius: 8, fontWeight: 600, minWidth: 130}}
                            >
                                Clue is OK
                            </Button>
                            <Button
                                type="primary"
                                danger
                                onClick={onReject}
                                style={{borderRadius: 8, fontWeight: 600, minWidth: 130}}
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
    );
}
