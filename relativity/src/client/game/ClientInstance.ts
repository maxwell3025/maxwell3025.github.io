import { Action, GameData, getPlayerTransform, Player } from "../../common/common";
import { invert, Matrix } from "../../common/geometry";
import { sendWebSocketMessage } from "./net";

export default class ClientInstance {
    data: GameData = {
        players: [],
        lasers: [],
        state: "lobby",
    };
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

    setReady(ready: boolean) {
        this.getCurrentPlayer().ready = ready;
        sendWebSocketMessage({
            messageType: "playerReady",
            playerId: this.currentPlayerId,
            ready,
        });
    }

    loadState(newState: GameData) {
        Object.assign(this.data, newState);
        console.log(this.data);
    }

    getCurrentPlayer(): Player {
        const currentPlayer = this.data.players.find(player => this.currentPlayerId === player.id);
        if(!currentPlayer) throw new Error(`Could not find player with id ${this.currentPlayerId}`);
        return currentPlayer;
    }

    /**
     * This gets the current transform.\
     * This transform converts the current frame-of-reference to global coords.
     * @returns 
     */
    getCurrentTransform(): Matrix | undefined {
        const currentPlayer = this.getCurrentPlayer();
        const transform = getPlayerTransform(currentPlayer, this.clientProperTime);
        if(!transform) return undefined;
        return transform;
    }

    /**
     * This gets the current inverse transform.\
     * This is a useful function for rendering etc where you need to convert things into your own frame-of-reference.\
     * This transform converts absolute coords to the current frame-of-reference.
     * @returns 
     */
    getCurrentInverseTransform(): Matrix | undefined {
        const currentPlayer = this.getCurrentPlayer();
        const transform = getPlayerTransform(currentPlayer, this.clientProperTime);
        if(!transform) return undefined;
        return invert(transform);
    }

    async step(){
        const player = this.getCurrentPlayer();
        if(this.clientProperTime > player.history.length){
        }
    }
}
