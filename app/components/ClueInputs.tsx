import { Input, InputNumber, Button } from "antd";

interface Props {
    clueWord: string;
    setClueWord: (val: string) => void;
    clueCount: number;
    setClueCount: (val: number) => void;
    onSend: () => void;
    disabled: boolean;
    remainingTeamCards: number;
}

export default function ClueInput({ clueWord, setClueWord, clueCount, setClueCount, onSend, disabled, remainingTeamCards }: Props) {
    return (
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
                onPressEnter={onSend}
                disabled={disabled}
                style={{ width: 180, borderRadius: 8 }}
            />
            <InputNumber
                min={0}
                max={remainingTeamCards + 1}
                value={clueCount}
                onChange={(val) => setClueCount(val ?? 1)}
                formatter={(value) => Number(value) > remainingTeamCards ? "∞" : String(value)}
                parser={(value) => value == "∞" ? remainingTeamCards + 1 : parseInt(value || "1", 10)}
                disabled={disabled}
                style={{ width: 70, borderRadius: 8 }}
            />
            <Button
                type="primary"
                onClick={onSend}
                style={{ height: 40, padding: "0 20px", borderRadius: 8, fontWeight: 600 }}
            >
                Publish Clue
            </Button>
        </div>
    );
}