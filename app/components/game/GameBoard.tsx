import { WordCard } from "@/types/wordCard";
import styles from "@/styles/game/gameBoard.module.css";

interface GameBoardProps {
  board: WordCard[];
  penaltyPickMode: boolean;
  colorOverlayActive: boolean;
  currentTurn: "red" | "blue";
  onCardClick: (card: WordCard) => void;
}

const getWordFontSize = (word: string) => {
  const length = word.length;

  if (length <= 6) return "clamp(0.85rem, 2vw, 1.9rem)";
  if (length <= 8) return "clamp(0.65rem, 1.5vw, 1.4rem)";
  if (length <= 11) return "clamp(0.55rem, 1.2vw, 1.12rem)";
  return "clamp(0.45rem, 1vw, 0.8rem)";
};

export default function GameBoard({
  board, penaltyPickMode, colorOverlayActive, currentTurn, onCardClick,
}: GameBoardProps) {

  const getCardClass = (card: WordCard) => {
    if (!card.revealed) {
      if (penaltyPickMode) {
        const isMyTeamCard =
          (currentTurn === "red" && card.cardType === "AGENTRED") ||
          (currentTurn === "blue" && card.cardType === "AGENTBLUE");
        return isMyTeamCard
          ? `${styles.card} ${styles.clickableCard}`
          : styles.card;
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
      case "CIVILIAN": return `${styles.card} ${styles.cardCivilian}`;
      case "AGENTBLUE": return `${styles.card} ${styles.cardBlueAgent}`;
      case "AGENTRED": return `${styles.card} ${styles.cardRedAgent}`;
      case "ASSASSIN": return `${styles.card} ${styles.cardAssassin}`;
      default: return styles.card;
    }
  };

  return (
    <div className={styles.board}>
      {board.map((card, index) => (
        <div
          key={index}
          className={getCardClass(card)}
          onClick={() => onCardClick(card)}
        >
          <span 
          className={styles.cardWord}
          style={{ fontSize: getWordFontSize(card.word) }}
          title={card.word}
          >
            {card.word}
          </span>
        </div>
      ))}
    </div>
  );
}
