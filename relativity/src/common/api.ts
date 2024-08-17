import { Action, GameState } from "./common";

export type NewPlayerPacket = {
    messageType: "newPlayer"
    id: string
    initialState: GameState
};

export type NewTurnPacket = {
    messageType: "newTurn"
    newState: GameState
};

export type TestPacket = {
    messageType: "test"
};

/** Client to server WS packet */
export type WsServerToClient =
    NewPlayerPacket | NewTurnPacket | TestPacket;

export type ChangeActionPacket = {
    messageType: "changeAction"
    playerId: string
    newAction: Action
};

export type WsClientToServer =
    ChangeActionPacket;
