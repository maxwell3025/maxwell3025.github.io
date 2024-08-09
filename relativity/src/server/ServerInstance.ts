import type { GameState, Player } from "../common/common";
import { Coord } from "../common/geometry";

export default class ServerInstance {
    state: GameState = { players: [] };
    censor(position: Coord): GameState {
        return structuredClone(this.state);
    }
    addPlayer(player: Player) {
        this.state.players.push(player);
    }
    evaluateTurn() {
        console.log("Evaluating new turn");
    }
}