import { WordCard } from "@/types/wordCard";
import styles from "@/styles/game/gameBoard.module.css";

interface GameBoardProps {
  board: WordCard[];
  penaltyPickMode: boolean;
  colorOverlayActive: boolean;
  currentTurn: "red" | "blue";
  onCardClick: (card: WordCard) => void;
  canClickCards: boolean;
}

const getWordFontSize = (word: string) => {
  const length = word.length;

  if (length <= 6) return "clamp(0.85rem, 2vw, 1.7rem)";
  if (length <= 8) return "clamp(0.65rem, 1.5vw, 1.4rem)";
  if (length <= 11) return "clamp(0.55rem, 1.2vw, 1.12rem)";
  return "clamp(0.45rem, 1vw, 0.8rem)";
};

export default function GameBoard({
  board, penaltyPickMode, colorOverlayActive, currentTurn, onCardClick, canClickCards
}: GameBoardProps) {

  const getCardClass = (card: WordCard) => {
    if (!card.revealed) {
      if (penaltyPickMode) {
        const isMyTeamCard =
          (currentTurn === "red" && card.cardType === "AGENTRED") ||
          (currentTurn === "blue" && card.cardType === "AGENTBLUE");
        return isMyTeamCard && canClickCards
          ? `${styles.card} ${styles.clickableCard}`
          : styles.card;
      }
      if (colorOverlayActive) {
        switch (card.cardType) {
          case "AGENTRED": return  canClickCards ? `${styles.card} ${styles.clickableCard} ${styles.cardOverlayRed}`
                                                 : `${styles.card} ${styles.cardOverlayRed}`;
          case "AGENTBLUE": return  canClickCards ? `${styles.card} ${styles.clickableCard} ${styles.cardOverlayRed}`
                                                 : `${styles.card} ${styles.cardOverlayRed}`;
          case "CIVILIAN": return  canClickCards ? `${styles.card} ${styles.clickableCard} ${styles.cardOverlayRed}`
                                                 : `${styles.card} ${styles.cardOverlayRed}`;
          case "ASSASSIN": return  canClickCards ? `${styles.card} ${styles.clickableCard} ${styles.cardOverlayRed}`
                                                 : `${styles.card} ${styles.cardOverlayRed}`;
        }
      }
      return canClickCards ? `${styles.card} ${styles.clickableCard}` : styles.card
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
          onClick={canClickCards ? () => onCardClick(card): undefined}
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
