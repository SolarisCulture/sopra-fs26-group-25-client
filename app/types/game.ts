import { Team } from "@/types/team"

export interface Game {
  status: "PAUSE" | "ACTIVE" | "FINISHED";
  currentRound: number;
  currentTurn: Team;
  currentPhase: "spy" | "spymaster";
  score: [number, number];
  maxRounds: number;
}
