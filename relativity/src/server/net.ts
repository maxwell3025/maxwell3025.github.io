import { WsClientToServer } from "../common/api";

const socket = new WebSocket("ws://localhost:8080");
const wsMessageQueues: Record<string, WsClientToServer[]> = { };
const wsMessageListeners: (() => boolean)[] = [];
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
            wsMessageListeners.push(messageListener);
        }
    });
}

export function processMessage(messageData: string){
    const message: WsClientToServer = JSON.parse(messageData);
    wsMessageQueues[message.messageType] ??= [];
    wsMessageQueues[message.messageType].push(message);
    for(let i = wsMessageListeners.length - 1; i >= 0; i--){
        if(wsMessageListeners[i]()) wsMessageListeners.splice(i, 1);
    }
    console.log("Received message");
}