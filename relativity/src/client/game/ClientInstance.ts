import { NewPlayerPacket, NewTurnPacket, PlayerReadyPacket } from "../../common/api";
import { Action, GameData, getPlayerTransform, Player } from "../../common/common";
import { invert, Matrix } from "../../common/geometry";
import NetworkHandler from "./NetworkHandler";

export default class ClientInstance {
    data: GameData = {
        players: [],
        lasers: [],
        state: "lobby",
    };
    currentPlayerId: string = "";
    clientProperTime: number = 0;
    maxProperTime: number = 0;
    networkHandler: NetworkHandler;
    newTurnListeners: ((packet: NewTurnPacket) => void)[] = [];
    playerReadyListeners: ((packet: PlayerReadyPacket) => void)[] = [];

    constructor(networkHandler: NetworkHandler){
        this.networkHandler = networkHandler;

        this.networkHandler.addPacketListener('newPlayer', packet => {
            console.log('New player joined');
            console.log(packet.player);
            if(packet.player.id !== this.currentPlayerId)
            this.data.players.push(packet.player);
        });

        this.networkHandler.addPacketListener('gameStart', packet => {
            console.log('Game Started!');
            this.data = packet.newState;
        });

        this.networkHandler.addPacketListener('playerReady', packet => {
            const player = this.data.players.find(player => player.id === packet.playerId);
            if(!player){
                console.warn(`Received playerReady packet for nonexistent player ${packet.playerId}!`);
                return;
            }
            player.ready = packet.ready;
            this.playerReadyListeners.forEach(handler => handler(packet));
        });

        this.networkHandler.addPacketListener('newTurn', async packet => {
            console.log("Applying new turn data");
            this.loadState(packet.newState);
            this.maxProperTime++;
            console.log(`Changed ${this.maxProperTime - 1} to ${this.maxProperTime}`);
            this.newTurnListeners.forEach(handler => handler(packet));
        });
    }

    async init(){
        const {id, initialState} = await this.networkHandler.awaitWebSocketMessage("clientConnection");
        this.loadState(initialState);
        this.currentPlayerId = id;
        console.log(initialState);
    }

    /**
     * Sets the selected action and sends the update to the server
     */
    setAction(action: Action) {
        this.getCurrentPlayer().currentAction = action;
        this.networkHandler.sendWebSocketMessage({
            messageType: "changeAction",
            playerId: this.currentPlayerId,
            newAction: action,
        });
    }

    /**
     * Sets the ready state of the current player
     */
    setReady(ready: boolean) {
        this.getCurrentPlayer().ready = ready;
        this.networkHandler.sendWebSocketMessage({
            messageType: "playerReady",
            playerId: this.currentPlayerId,
            ready,
        });
    }

    /**
     * Sets the current data to the state
     */
    loadState(newState: GameData) {
        Object.assign(this.data, newState);
        console.log(this.data);
    }

    /**
     * Returns the current player
     */
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

    /**
     * Add a listener that fires after a new turn is processed by the client instance
     */
    addNewTurnListener(listener: (packet: NewTurnPacket) => void) {
        this.newTurnListeners.push(listener);
    }

    /**
     * Adds a new listener that fires after a player changes their "ready" state
     */
    addPlayerReadyListener(listener: (packet: PlayerReadyPacket) => void) {
        this.playerReadyListeners.push(listener);
    }

    async step(){
        const player = this.getCurrentPlayer();
        if(this.clientProperTime > player.history.length){
        }
    }
}
