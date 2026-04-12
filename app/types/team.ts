import { User } from "@/types/user"

export interface Team{
  teamColor: "BLUE" | "RED";
  players: User[];
}
