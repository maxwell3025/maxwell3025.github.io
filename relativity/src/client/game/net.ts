import { WsClientToServer, WsServerToClient } from "../../common/api";

console.log(import.meta.env.VITE_WS_URL);
if(!import.meta.env.VITE_WS_URL) {
    throw new Error('VITE_WS_URL is undefined');
}
const socket = new WebSocket(import.meta.env.VITE_WS_URL);
const wsMessageQueues: Record<string, WsServerToClient[]> = { };
const wsMessageQueries: (() => boolean)[] = [];
/** List of regular message listeners */
const wsMessageListeners: Record<string, ((message: WsServerToClient) => void)[]> = { };
export async function awaitWebSocketMessage<T extends WsServerToClient['messageType']>(messageType: T): Promise<Extract<WsServerToClient, {messageType: T}>>{
    return new Promise(resolve => {
        wsMessageQueues[messageType] ??= [];
        const queue = wsMessageQueues[messageType];
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
            wsMessageQueries.push(messageListener);
        }
    });
}

/**
 * Adds a regular listener for a specific type of message\
 * Note that this does not interfere with awaitWebSocketMessage
 */
export function addPacketListener<T extends WsServerToClient['messageType']>(
    messageType: T,
    handler: (message: Extract<WsServerToClient, {messageType: T}>) => void,
): {
    close: () => void,
} {
    const handlerCasted = handler as (message: WsServerToClient) => void;
    wsMessageListeners[messageType] ??= [];
    wsMessageListeners[messageType].push(handlerCasted);
    return {
        close() {
            const index = wsMessageListeners[messageType].indexOf(handlerCasted);
            if(index !== -1){
                wsMessageListeners[messageType].splice(index, 1);
            }
        },
    };
}

export function sendWebSocketMessage(message: WsClientToServer){
    socket.send(JSON.stringify(message));
}
socket.addEventListener("message", event => {
    const message: WsServerToClient = JSON.parse(event.data);

    // Handle regular listeners
    wsMessageListeners[message.messageType] ??= [];
    wsMessageListeners[message.messageType].forEach(handler => {
        handler(message);
    });
    
    // Handle one-shot message listeners
    wsMessageQueues[message.messageType] ??= [];
    wsMessageQueues[message.messageType].push(message);
    for(let i = wsMessageQueries.length - 1; i >= 0; i--){
        if(wsMessageQueries[i]()) wsMessageQueries.splice(i, 1);
    }
    console.log("Received message");
});