import { Input, InputNumber, Button } from "antd";
import styles from "@/styles/clueInput.module.css";

interface Props {
  clueWord: string;
  setClueWord: (val: string) => void;
  clueCount: number;
  setClueCount: (val: number) => void;
  onSend: () => void;
  disabled: boolean;
  remainingTeamCards: number;
}

export default function ClueInput({
  clueWord, setClueWord, clueCount, setClueCount,
  onSend, disabled, remainingTeamCards,
}: Props) {
  return (
    <div className={styles.container}>
      <Input
        placeholder="Clue word"
        value={clueWord}
        onChange={(e) => setClueWord(e.target.value)}
        onPressEnter={onSend}
        disabled={disabled}
        className={styles.wordInput}
      />
      <InputNumber
        min={0}
        max={remainingTeamCards + 1}
        value={clueCount}
        onChange={(val) => setClueCount(val ?? 1)}
        formatter={(value) =>
          Number(value) > remainingTeamCards ? "∞" : String(value)
        }
        parser={(value) =>
          value === "∞" ? remainingTeamCards + 1 : parseInt(value || "1", 10)
        }
        disabled={disabled}
        className={styles.countInput}
      />
      <Button
        type="primary"
        onClick={onSend}
        disabled={disabled}
        className={styles.sendButton}
      >
        Publish
      </Button>
    </div>
  );
}