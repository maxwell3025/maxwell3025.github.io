import type { GameState, Player } from "../common/common";
import { Vector } from "../common/geometry";

export default class ServerInstance {
    state: GameState = { players: [] };
    censor(position: Vector): GameState {
        return structuredClone(this.state);
    }
    addPlayer(player: Player) {
        this.state.players.push(player);
    }
    evaluateTurn() {
        console.log("Evaluating new turn");
    }
}