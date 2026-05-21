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


export default function GameBoard({
  board, penaltyPickMode, colorOverlayActive, currentTurn, onCardClick, canClickCards
}: GameBoardProps) {

  const getCardClass = (card: WordCard) => {
    if (!card.revealed) {
      if (penaltyPickMode) {
          if (colorOverlayActive) {
          switch (card.cardType) {
            case "AGENTRED": return `${styles.card} ${styles.clickableCard} ${styles.cardOverlayRed}`;
            case "AGENTBLUE": return `${styles.card} ${styles.clickableCard} ${styles.cardOverlayBlue}`;
            case "CIVILIAN": return `${styles.card} ${styles.clickableCard} ${styles.cardOverlayCivilian}`;
            case "ASSASSIN": return `${styles.card} ${styles.clickableCard} ${styles.cardOverlayAssassin}`;
          }
        }
        const isMyTeamCard =
          (currentTurn === "red" && card.cardType === "AGENTRED") ||
          (currentTurn === "blue" && card.cardType === "AGENTBLUE");
        return isMyTeamCard && canClickCards
          ? `${styles.card} ${styles.clickableCard}`
          : styles.card;
      }
      if (colorOverlayActive) {
        switch (card.cardType) {
          case "AGENTRED": return  `${styles.card} ${styles.cardOverlayRed}`
          case "AGENTBLUE": return  `${styles.card} ${styles.cardOverlayBlue}`
          case "CIVILIAN": return  `${styles.card} ${styles.cardOverlayCivilian}`
          case "ASSASSIN": return  `${styles.card} ${styles.cardOverlayAssassin}`
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

  const getWordClass = (word: string) => {
    const longestSegment = Math.max(...word.split(/\s+/).map((segment) => segment.length));

    if (longestSegment >= 13 || word.length >= 16) {
      return `${styles.cardWord} ${styles.veryLongCardWord}`;
    }

    if (longestSegment >= 10 || word.length >= 12) {
      return `${styles.cardWord} ${styles.longCardWord}`;
    }

    return styles.cardWord;
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
          className={getWordClass(card.word)}
          title={card.word}
          >
            {card.word}
          </span>
        </div>
      ))}
    </div>
  );
}
