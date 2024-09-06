import { WsClientToServer, WsServerToClient } from "../../common/api";

export default class NetworkHandler{
    wsMessageQueues: Record<string, WsServerToClient[]> = { };
    wsMessageQueries: (() => boolean)[] = [];
    /** List of regular message listeners */
    wsMessageListeners: Record<string, ((message: WsServerToClient) => void)[]> = { };
    socket: WebSocket;

    constructor(socket: WebSocket){
        this.socket = socket;

        this.socket.addEventListener("message", event => {
            const message: WsServerToClient = JSON.parse(event.data);

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
        });
    }

    async awaitWebSocketMessage<T extends WsServerToClient['messageType']>(messageType: T): Promise<Extract<WsServerToClient, {messageType: T}>>{
        return new Promise(resolve => {
            this.wsMessageQueues[messageType] ??= [];
            const queue = this.wsMessageQueues[messageType];
            const messageListener = () => {
                if(queue.length > 0){
                    const message = queue.shift()!;
                    if(message.messageType === messageType)
                    resolve(message as Extract<WsServerToClient, {messageType: T}>);
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
    addPacketListener<T extends WsServerToClient['messageType']>(
        messageType: T,
        handler: (message: Extract<WsServerToClient, {messageType: T}>) => void,
    ): {
        close: () => void,
    } {
        const handlerCasted = handler as (message: WsServerToClient) => void;
        this.wsMessageListeners[messageType] ??= [];
        const relevantMessageListeners = this.wsMessageListeners[messageType];
        this.wsMessageListeners[messageType].push(handlerCasted);
        return {
            close() {
                const index = relevantMessageListeners.indexOf(handlerCasted);
                if(index !== -1){
                    relevantMessageListeners.splice(index, 1);
                }
            },
        };
    }

    sendWebSocketMessage(message: WsClientToServer){
        this.socket.send(JSON.stringify(message));
    }
}