import { Server } from "bun";
import { WsClientToServer, WsServerToClient } from "../common/api";

export default class NetworkHandler {
    /** Backlog of websocket messages received */
    wsMessageQueues: Record<string, WsClientToServer[]> = { };
    /** List of one-shot listeners for ws messages */
    wsMessageQueries: (() => boolean)[] = [];
    /** List of regular message listeners */
    wsMessageListeners: Record<string, ((message: WsClientToServer) => void)[]> = { };
    /** This is the server */
    server: Server;

    constructor(server: Server) {
        this.server = server;
    }

    /**
     * This function awaits and consumes a websocket message
     * @param messageType 
     * @returns 
     */
    async awaitWebSocketMessage<T extends WsClientToServer['messageType']>(messageType: T): Promise<Extract<WsClientToServer, {messageType: T}>>{
        return new Promise(resolve => {
            this.wsMessageQueues[messageType] ??= [];
            const queue = this.wsMessageQueues[messageType];
            const messageListener = () => {
                if(queue.length > 0){
                    const message = queue.shift()!;
                    if(message.messageType === messageType)
                    resolve(message as Extract<WsClientToServer, {messageType: T}>);
                    return true;
                } else {
                    return false;
                }
            };
            if(!messageListener()){
                this.wsMessageQueries.push(messageListener);
            }
        });
    }

    /**
     * Adds a regular listener for a specific type of message\
     * Note that this does not interfere with awaitWebSocketMessage
     */
    addPacketListener<T extends WsClientToServer['messageType']>(
        messageType: T,
        handler: (message: Extract<WsClientToServer, {messageType: T}>) => void,
    ): {
        close: () => void,
    } {
        const handlerCasted = handler as (message: WsClientToServer) => void;
        this.wsMessageListeners[messageType] ??= [];
        const relevantListeners = this.wsMessageListeners[messageType];
        relevantListeners.push(handlerCasted);
        return {
            close() {
                const index = relevantListeners.indexOf(handlerCasted);
                if(index !== -1){
                    relevantListeners.splice(index, 1);
                }
            },
        };
    }

    /**
     * This function takes a raw WebSocket message and routes it to the correct message queue depending on the message type
     */
    processMessage(messageData: string){
        const message: WsClientToServer = JSON.parse(messageData);

        // Handle regular listeners
        this.wsMessageListeners[message.messageType] ??= [];
        this.wsMessageListeners[message.messageType].forEach(handler => {
            handler(message);
        });
        
        // Handle one-shot message listeners
        this.wsMessageQueues[message.messageType] ??= [];
        this.wsMessageQueues[message.messageType].push(message);
        for(let i = this.wsMessageQueries.length - 1; i >= 0; i--){
            if(this.wsMessageQueries[i]()) this.wsMessageQueries.splice(i, 1);
        }
        console.log("Received message");
    }

    publish<T extends WsServerToClient['messageType']>(messageType: T, message: Extract<WsServerToClient, {messageType: T}>){
        this.server.publish(messageType, JSON.stringify(message));
    }
}