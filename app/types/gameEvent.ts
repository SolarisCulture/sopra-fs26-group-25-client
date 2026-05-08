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

export interface GameBoardPayload {
  id: number;
  clueWord: string | null;
  clueCount: number;
  currentTurn: "RED" | "BLUE";
  currentPhase: string;
  guessesRemaining: number;
  cards: WordCard[];
  redScore: number;
  blueScore: number;
  status: string;
  timer: number;
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

export interface ClueApprovedEvent extends GameEventBase {
  type: "ClueApproved";
}

export interface ClueRuledInvalidEvent extends GameEventBase {
  type: "ClueRuledInvalid";
}

export interface ReportedGuessEvent extends GameEventBase, Guess {
  type: "ReportedGuess";
}

export interface TurnChangedEvent {
    type: "TurnChanged";
    timeStamp: string;
    player: User;
    description: string;
    team: "red" | "blue";
}

// Events received FROM backend — type strings match EventType.toString() values
export interface ServerClueEvent {
  type: "Clue";
  lobbyCode: string;
  board: GameBoardPayload;
}

export interface ServerGuessEvent {
  type: "Guess";
  lobbyCode: string;
  board: GameBoardPayload;
}

export interface ServerTurnChangedEvent {
  type: "TurnChanged";
  lobbyCode: string;
  board: GameBoardPayload;
}

export interface ServerGameStartedEvent {
  type: "GameStarted";
  lobbyCode: string;
  board: GameBoardPayload;
}

export interface ServerBoardRegeneratedEvent {
  type: "BoardRegenerated";
  lobbyCode: string;
  board: GameBoardPayload;
}

export interface ServerGameOverEvent {
  type: "GameOver";
  lobbyCode: string;
  board: GameBoardPayload;
}

export interface ServerReturningToLobbyEvent {
  type: "ReturningToLobby"
  lobbyCode: string;
}

export interface ServerReturningToLobbyAfterDisconnectEvent {
  type: "ReturningToLobbyAfterDisconnect"
  lobbyCode: string;
}

export interface ServerGameRestartingEvent {
  type: "GameRestarting"
  lobbyCode: string;
  board: GameBoardPayload;
}

export interface ServerGamePausedEvent {
  type: "GamePaused";
  lobbyCode: string;
}

export interface ServerGameResumedEvent {
  type: "GameResumed";
  lobbyCode: string;
}

export interface ServerPlayersUpdatedEvent {
  type: "PlayersUpdated";
  lobbyCode: string;
}

export interface ServerTimerUpdateEvent {
  type: "TIMER_UPDATE";
  lobbyCode: string;
  board?: GameBoardPayload | null;
  timer?: number;
  remainingTime?: number;
  data?: number;
}

// GameEvent is only inbound events (what the socket receives)
export type GameEvent =
  | ServerClueEvent
  | ServerGuessEvent
  | ServerTurnChangedEvent
  | ServerGameStartedEvent
  | ServerBoardRegeneratedEvent
  | ServerGameOverEvent
  | ServerReturningToLobbyEvent 
  | ServerGameRestartingEvent
  | ServerGamePausedEvent
  | ServerGameResumedEvent
  | ServerReturningToLobbyAfterDisconnectEvent
  | ServerPlayersUpdatedEvent
  | ServerTimerUpdateEvent
  | ClueReportedEvent
  | ClueApprovedEvent
  | ClueRuledInvalidEvent
  | ReportedGuessEvent;
