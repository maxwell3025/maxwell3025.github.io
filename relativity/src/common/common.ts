import { Vector, Matrix, getIdentity } from "./geometry";

/**
 * A starting position and action(thrust, fire, etc.)
 */
export type HistoryEntry = {
    position: Vector
    /** velocity and orientation */
    transform: Matrix
    action: Action
};

// Light-like thrust action
export type ThrustAction = {
    type: "thrust"
    x: number
    y: number
};

export type NukeAction = {
    type: "nuke"
};

export type LaserAction = {
    type: "laser"
};

export type Action =
    ThrustAction |
    NukeAction |
    LaserAction;

export function getDefaultAction(): Action {
    return {
        type: 'thrust',
        x: 0,
        y: 0,
    };
}

export type Player = {
    /** A unique identifier for the player within the game */
    id: string
    /** The final certain position of the player and what we show the client */
    clientPosition: Vector
    /**
     * The orientation and velocity corresponding to `clientPosition`.
     * The forward transform should be used to find energy-momentum from rest vector and the backward transform should be used to rendering.
     */
    finalTransform: Matrix
    /**
     * The final position of the player assuming no interference.
     * This is what we use to calculate uncertainty regions.
     */
    finalPosition: Vector
    /** A full timeline of player actions including final uncertain action */
    history: HistoryEntry[]
    /** The action currently scheduled to be taken after `finalPosition` */
    currentAction: Action
    matter: number
    antimatter: number
};

export function getSpacetimePosition(player: Player, time: number): Vector | undefined {
    const index = Math.floor(time);
    const fracTime = time - Math.floor(time);
    const historyEntry = player.history[index];
    if(time < 0){
        if(player.history.length > 0){
            return {
                x: player.history[0].position.x,
                y: player.history[0].position.y,
                t: time,
            };
        }
        else{
            return {
                x: player.finalPosition.x,
                y: player.finalPosition.y,
                t: time,
            };
        }
    }
    if(historyEntry){
        return {
            x: historyEntry.position.x,
            y: historyEntry.position.y,
            t: time,
        };
    }
    if(time === player.history.length){
        return player.finalPosition;
    }
}

export function getTransform(player: Player, time: number): Matrix | undefined {
    const index = Math.floor(time);
    const fracTime = time - Math.floor(time);
    const historyEntry = player.history[index];
    if(time < 0){
        return getIdentity();
    }
    if(historyEntry){
        return historyEntry.transform;
    }
    if(time === player.history.length){
        return player.finalTransform;
    }
}

export type GameState = {
    players: Player[]
};
