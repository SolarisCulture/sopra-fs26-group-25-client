export type CardType = "AGENTBLUE" | "AGENTRED" | "CIVILIAN" | "ASSASSIN";

export interface WordCard{
  word: string;
  cardType: CardType;
  revealed: boolean;
}
