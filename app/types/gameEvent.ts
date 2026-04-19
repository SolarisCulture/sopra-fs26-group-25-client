import { User } from "@/types/user";
import { WordCard } from "./wordCard";

export interface GameEventBase {
  timeStamp: string;
  player: User;
  description: string;
}

export interface Clue {
  word: string;
  count: number;
}

export interface Guess {
  guessedCard: WordCard;
}

export interface ClueEvent extends GameEventBase, Clue {
  type: "Clue";
}

export interface GuessEvent extends GameEventBase, Guess {
  type: "Guess";
}

export interface ClueReportedEvent extends GameEventBase, Clue {
  type: "ClueReported";
}

export interface ClueRulingEvent extends GameEventBase {
  type: "ClueApproved" | "ClueRuledInvalid";
}

export interface postGameScreen extends GameEventBase {
  type: "GameOver" | "RETURNING_TO_LOBBY";
}

export interface TurnChangedEvent {
    type: "TurnChanged";
    timeStamp: string;
    player: User;
    description: string;
    team: "red" | "blue";
}

export type GameEvent = ClueEvent | GuessEvent | ClueReportedEvent | ClueRulingEvent | TurnChangedEvent | postGameScreen;
