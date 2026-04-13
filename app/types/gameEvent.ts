import { User } from "@/types/user";
import { WordCard } from "./wordCard";

export interface GameEventBase {
  type: "Clue" | "Guess";
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

export type GameEvent = ClueEvent | GuessEvent;
