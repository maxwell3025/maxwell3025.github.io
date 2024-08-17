import { getNextEntry, type GameState, type HistoryEntry, type Player } from "../common/common";
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
        // TODO filter to only apply rules to players that can move ahead
        this.state.players.forEach(player => {
            const currentEntry: HistoryEntry = {
                transform: player.finalTransform,
                action: player.currentAction,
            };
            const dataNext = getNextEntry(currentEntry);
            player.history.push(currentEntry);
            player.finalTransform = dataNext.transform;
            player.clientTransform = dataNext.transform;
            player.currentAction = dataNext.action;
        });
        console.log("Evaluating new turn");
    }
}