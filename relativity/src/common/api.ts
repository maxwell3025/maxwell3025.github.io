import { Action, GameState, Player } from "./common";

/** Sent as part of the connection handshake */
export type ClientConnectionPacket = {
    messageType: "clientConnection"
    id: string
    initialState: GameState
};

export type NewPlayerPacket = {
    messageType: "newPlayer"
    player: Player
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
    ClientConnectionPacket | NewPlayerPacket | NewTurnPacket | TestPacket;

export type ChangeActionPacket = {
    messageType: "changeAction"
    playerId: string
    newAction: Action
};

export type WsClientToServer =
    ChangeActionPacket;
