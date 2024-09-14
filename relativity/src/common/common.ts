import { Vector, Matrix, getExponential, mul, getOrigin, TriangleMesh } from "./geometry";

//#region Action
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
    /** angle of laser(CCW from positive X) in player FOR */
    theta: number,
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
//#endregion

//#region PlayerState
export type PlayerState = {
    matter: number
    antimatter: number
    transform: Matrix
};
//#endregion

//#region HistoryEntry
// TODO add exponential function caching
/**
 * A starting position and action(thrust, fire, etc.)
 */
export type HistoryEntry = {
    state: PlayerState
    action: Action
};

/**
 * Interpolates the history entry.\
 * For example, setting time = 0 just returns the starting state for the history entry.\
 * setting time = 1 returns the \
 * @param entry current history entry
 */
export function getInterpolatedState(entry: HistoryEntry, time: number): PlayerState{
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

    /**
     * This is the burn rate while accelerating -- this is an exponential
     * We are assuming that the thrusters use light or something -- basically ideal thrusters for now
     */
    const burnRate = entry.action.actionType === 'thrust' ? Math.hypot(
        entry.action.x,
        entry.action.y,
    ) : 0;

    /**
     * The total amount of matter + antimatter that is being burned
     */
    const burnAmount = (entry.state.matter + entry.state.antimatter) * (1 - Math.exp(-burnRate * time));
    
    return {
        transform: mul(entry.state.transform, accelerationExponential(time)),
        matter: entry.state.matter - 0.5 * burnAmount,
        antimatter: entry.state.antimatter - 0.5 * burnAmount,
    };
}
//#endregion

//#region Player
export type Player = {
    /** A unique identifier for the player within the game */
    id: string
    /**
     * The position, orientation, and velocity of the player.
     * The forward transform should be used to find energy-momentum from rest vector and the backward transform should be used to rendering.
     */
    finalState: PlayerState
    /** A full timeline of player actions including final uncertain action */
    history: HistoryEntry[]
    /** The action currently scheduled to be taken after `finalTransform` */
    currentAction: Action
    /** The minimum amount of matter required onboard */
    minimumMatter: number
    /** Is the player ready to start/currently playing */
    ready: boolean
};

/**
 * Returns the transform from player's frame of reference at a given player proper time to the server's frame of reference.
 * @param player 
 * @param time 
 * @returns 
 */
export function getPlayerTransform(player: Player, time: number): Matrix | undefined {
    const index = Math.floor(time);
    const fracTime = time - index;
    const historyEntry = player.history[index];
    if(time < 0){
        if(player.history.length > 0){
            return mul(player.history[0].state.transform, [
                1, 0, 0, time,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ]);
        }
        else{
            return mul(player.finalState.transform, [
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

        const roundedTransform = historyEntry.state.transform;
        const partialTransform = accelerationExponential(fracTime);

        const totalTransform = mul(roundedTransform, partialTransform);
        return totalTransform;
    }
    if(time === player.history.length){
        return player.finalState.transform;
    }
}

export function getPlayerPosition(player: Player, time: number): Vector | undefined {
    const transform = getPlayerTransform(player, time);
    if(transform) return mul(transform, getOrigin());
}
//#endregion

//#region GameData
export type GameState =
    "lobby" |
    "active";

export type GameData = {
    players: Player[]
    lasers: TriangleMesh[]
    state: GameState
};
//#endregion
