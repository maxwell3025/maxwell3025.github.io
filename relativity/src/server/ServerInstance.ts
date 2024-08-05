import type { Coord, GameState, Player } from "../common/common";

export default class ServerInstance {
    state: GameState = { players: [] }
    censor(position: Coord): GameState {
        return structuredClone(this.state);
    }
    addPlayer(player: Player) {
        this.state.players.push(player)
    }
}