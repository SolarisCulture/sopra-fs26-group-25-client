import { Modal, Button } from "antd";
import { WordCard } from "@/types/wordCard";

interface Props {
    open: boolean;
    penaltyCardPicked: WordCard | null;
    onConfirm: () => void;
    setPenaltyConfirmOpen: (val: boolean) => void;
    setPenaltyCardPicked: (val: WordCard | null) => void;
}

export default function PenaltyConfirmModal({ open, penaltyCardPicked, onConfirm, setPenaltyConfirmOpen,setPenaltyCardPicked }: Props) {
    return (
        <Modal
            title={<div style={{ color: "#000", textAlign: "center", fontSize: 18, fontWeight: 700 }}>Confirm Free Reveal</div>}
            open={open}
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
                    Reveal <strong>&quot;{penaltyCardPicked?.word}&quot;</strong> as your free card? This cannot be undone.
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
                        onClick={onConfirm}
                        style={{ borderRadius: 8, fontWeight: 600 }}
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </Modal>
    );
}