export type Coord = {
    x: number
    y: number
    t: number
}

/**
 * A starting position and action(thrust, fire, etc.)
 */
export type Action = {
    position: Coord
}

export type Player = {
    /** A unique identifier for the player within the game */
    id: string
    /** The final certain position of the Player */
    currentPosition: Coord
    /** The final position of the Player assuming no interference */
    nextPosition: Coord
    /** A full timeline of player actions including final uncertain action */
    history: Action[]
    matter: number
    antimatter: number
}

export function getSpacetimePosition(player: Player, time: number): Coord | undefined{
    const index = Math.floor(time)
    const fracTime = time - Math.floor(time)
    const historyEntry = player.history[index]
    if(time < 0){
        return {
            x: player.history[0].position.x,
            y: player.history[0].position.y,
            t: time,
        }
    }
    if(historyEntry){
        return {
            x: historyEntry.position.x,
            y: historyEntry.position.y,
            t: time,
        }
    }
}

export type GameState = {
    players: Player[]
}

export type NewPlayerRequest = {
    starting: Coord
}

export type NewPlayerResponse = {
    id: string
    initialState: GameState
}