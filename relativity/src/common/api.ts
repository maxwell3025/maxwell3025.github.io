import { Coord, GameState } from "./common"

export type NewPlayerRequest = {
    starting: Coord
}

export type NewPlayerResponse = {
    id: string
    initialState: GameState
}
