import { WsClientToServer } from "../common/api";

/** Backlog of websocket messages recieved */
const wsMessageQueues: Record<string, WsClientToServer[]> = { };
/** List of one-shot listeners for ws messages */
const wsMessageQueries: (() => boolean)[] = [];
/** List of regular message listeners */
const wsMessageListeners: Record<string, ((message: WsClientToServer) => void)[]> = { };

/**
 * This function awaits and consumes a websocket message
 * @param messageType 
 * @returns 
 */
export async function awaitWebSocketMessage<T extends WsClientToServer['messageType']>(messageType: T): Promise<Extract<WsClientToServer, {messageType: T}>>{
    return new Promise(resolve => {
        wsMessageQueues[messageType] ??= [];
        const queue = wsMessageQueues[messageType];
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
            wsMessageQueries.push(messageListener);
        }
    });
}

/**
 * Adds a regular listener for a specific type of message\
 * Note that this does not interfere with awaitWebSocketMessage
 */
export function addPacketListener<T extends WsClientToServer['messageType']>(
    messageType: T,
    handler: (message: Extract<WsClientToServer, {messageType: T}>) => void,
): {
    close: () => void,
} {
    const handlerCasted = handler as (message: WsClientToServer) => void;
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

/**
 * This function takes a raw WebSocket message and routes it to the correct message queue depending on the message type
 */
export function processMessage(messageData: string){
    const message: WsClientToServer = JSON.parse(messageData);

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
}