import { GameState, Player } from "../../common/common";

export default class ClientInstance {
    state: GameState = { players: [] }
    currentPlayerId: string = ""
    loadState(newState: GameState) {
        Object.assign(this.state, newState)
    }
    getCurrentPlayer(): Player {
        const currentPlayer = this.state.players.find(player => this.currentPlayerId === player.id)
        if(!currentPlayer) throw new Error(`Could not find player with id ${this.currentPlayerId}`)
        return currentPlayer
    }
}