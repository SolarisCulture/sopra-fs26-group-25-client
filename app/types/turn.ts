import { Team } from "@/types/team";
import { WordCard } from "@/types/wordCard";
import { Clue } from "@/types/clue";

export interface Turn {
  currentTeam: Team;
  phase: "SPY" | "SPYMASTER";
  startTime: string;
  clue: Clue | null;
  guesses: WordCard[];
}
