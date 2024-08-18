import { Action, GameState, Player } from "../../common/common";
import { sendWebSocketMessage } from "./net";

export default class ClientInstance {
    state: GameState = { players: [] };
    currentPlayerId: string = "";
    clientProperTime: number = 0;
    maxProperTime: number = 0;

    setAction(action: Action) {
        this.getCurrentPlayer().currentAction = action;
        sendWebSocketMessage({
            messageType: "changeAction",
            playerId: this.currentPlayerId,
            newAction: action,
        });
    }

    loadState(newState: GameState) {
        Object.assign(this.state, newState);
        console.log(this.state);
    }

    getCurrentPlayer(): Player {
        const currentPlayer = this.state.players.find(player => this.currentPlayerId === player.id);
        if(!currentPlayer) throw new Error(`Could not find player with id ${this.currentPlayerId}`);
        return currentPlayer;
    }

    async step(){
        const player = this.getCurrentPlayer();
        if(this.clientProperTime > player.history.length){
        }
    }
}
