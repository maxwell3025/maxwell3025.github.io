import { GameState } from "./common";

export type NewPlayerPacket = {
    messageType: "newPlayer"
    id: string
    initialState: GameState
};

export type TestPacket = {
    messageType: "test"
};

/** Client to server WS packet */
export type WsServerToClient =
    NewPlayerPacket | TestPacket;

export type ChangeActionPacket = {
    messageType: "changeAction"
    playerId: string

};

export type WsClientToServer =
    ChangeActionPacket;
