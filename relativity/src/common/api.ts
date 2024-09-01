import { Action, GameData, Player } from "./common";

/** Sent as part of the connection handshake */
export type ClientConnectionPacket = {
    messageType: "clientConnection"
    id: string
    initialState: GameData
};

export type NewPlayerPacket = {
    messageType: "newPlayer"
    player: Player
};

export type NewTurnPacket = {
    messageType: "newTurn"
    newState: GameData
};

export type GameStartPacket = {
    messageType: "gameStart"
    newState: GameData
};

export type TestPacket = {
    messageType: "test"
};

/** Client to server WS packet */
export type WsServerToClient =
    ClientConnectionPacket | NewPlayerPacket | NewTurnPacket | GameStartPacket | TestPacket;

export type ChangeActionPacket = {
    messageType: "changeAction"
    playerId: string
    newAction: Action
};

export type PlayerReadyPacket = {
    messageType: "playerReady"
    playerId: string
    ready: boolean
};

export type WsClientToServer =
    ChangeActionPacket | PlayerReadyPacket;
