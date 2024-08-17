import { Vector, Matrix, getIdentity, getExponential, mul, getOrigin } from "./geometry";

// TODO add exponential function caching
/**
 * A starting position and action(thrust, fire, etc.)
 */
export type HistoryEntry = {
    /** position, velocity, orientation */
    transform: Matrix
    action: Action
};

/**
 * Gets the entry after the current history entry assuming default action
 * @param entry current history entry
 */
export function getNextEntry(entry: HistoryEntry): HistoryEntry{
    let accelerationX = 0;
    let accelerationY = 0;
    if(entry.action.actionType === "thrust"){
        accelerationX = entry.action.x;
        accelerationY = entry.action.y;
    }

    const accelerationGenerator: Matrix = [
        0, accelerationX, accelerationY, 1,
        accelerationX, 0, 0, 0,
        accelerationY, 0, 0, 0,
        0, 0, 0, 0,
    ];

    const accelerationExponential = getExponential(accelerationGenerator);
    
    return {
        transform: mul(entry.transform, accelerationExponential(1)),
        action: getDefaultAction(),
    };
}

// Light-like thrust action
export type ThrustAction = {
    actionType: "thrust"
    // x acceleration in player FOR
    x: number
    // y acceleration in player FOR
    y: number
};

export type NukeAction = {
    actionType: "nuke"
};

export type LaserAction = {
    actionType: "laser"
};

export type Action =
    ThrustAction |
    NukeAction |
    LaserAction;

export type ActionType = Action['actionType'];

export function getDefaultAction(): Action {
    return {
        actionType: 'thrust',
        x: 0,
        y: 0,
    };
}

export type Player = {
    /** A unique identifier for the player within the game */
    id: string
    /** The final certain position of the player and what we show the client */
    clientTransform: Matrix
    /**
     * The position, orientation, and velocity of the player
     * The forward transform should be used to find energy-momentum from rest vector and the backward transform should be used to rendering.
     */
    finalTransform: Matrix
    /** A full timeline of player actions including final uncertain action */
    history: HistoryEntry[]
    /** The action currently scheduled to be taken after `finalTransform` */
    currentAction: Action
    matter: number
    antimatter: number
};

export function getPlayerTransform(player: Player, time: number): Matrix | undefined {
    const index = Math.floor(time);
    const fracTime = time - index;
    const historyEntry = player.history[index];
    if(time < 0){
        if(player.history.length > 0){
            return mul(player.history[0].transform, [
                1, 0, 0, time,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ]);
        }
        else{
            return mul(player.finalTransform, [
                1, 0, 0, time,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ]);
        }
    }
    if(historyEntry){
        let accelerationX = 0;
        let accelerationY = 0;
        if(historyEntry.action.actionType === "thrust"){
            accelerationX = historyEntry.action.x;
            accelerationY = historyEntry.action.y;
        }

        const accelerationGenerator: Matrix = [
            0, accelerationX, accelerationY, 1,
            accelerationX, 0, 0, 0,
            accelerationY, 0, 0, 0,
            0, 0, 0, 0,
        ];

        const accelerationExponential = getExponential(accelerationGenerator);

        const roundedTransform = historyEntry.transform;
        const partialTransform = accelerationExponential(fracTime);

        const totalTransform = mul(roundedTransform, partialTransform);
        return totalTransform;
    }
    if(time === player.history.length){
        return player.finalTransform;
    }
}

export function getPlayerPosition(player: Player, time: number): Vector | undefined {
    const transform = getPlayerTransform(player, time);
    if(transform) return mul(transform, getOrigin());
}

export type GameState = {
    players: Player[]
};
