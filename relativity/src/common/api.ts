import { Action, GameData, Player } from "./common";

//#region common packets
export type PlayerReadyPacket = {
    messageType: "playerReady"
    playerId: string
    ready: boolean
};
//#endregion

//#region server to client packets
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
    ClientConnectionPacket | NewPlayerPacket | NewTurnPacket | GameStartPacket | TestPacket | PlayerReadyPacket;
//#endregion

//#region client to server packets
export type ChangeActionPacket = {
    messageType: "changeAction"
    playerId: string
    newAction: Action
};

export type WsClientToServer =
    ChangeActionPacket | PlayerReadyPacket;
//#endregion