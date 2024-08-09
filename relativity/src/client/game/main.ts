import { WsServerToClient } from '../../common/api';
import ClientInstance from './ClientInstance';
import { render } from './renderer';

const params = new URLSearchParams(window.location.search);

const instance = new ClientInstance();

const socket = new WebSocket("ws://localhost:8080");
const wsMessageQueues: Record<string, WsServerToClient[]> = { };
const wsMessageListeners: (() => boolean)[] = [];
async function awaitWebSocketMessage<T extends WsServerToClient['messageType']>(messageType: T): Promise<Extract<WsServerToClient, {messageType: T}>>{
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
            wsMessageListeners.push(messageListener);
        }
    });
}
socket.addEventListener("message", event => {
    const message: WsServerToClient = JSON.parse(event.data);
    wsMessageQueues[message.messageType] ??= [];
    wsMessageQueues[message.messageType].push(message);
    for(let i = wsMessageListeners.length - 1; i >= 0; i--){
        if(wsMessageListeners[i]()) wsMessageListeners.splice(i, 1);
    }
    console.log("Received message");
});

await init();

console.log('initialized');

render(instance);

async function init() {
    const {id, initialState} = await awaitWebSocketMessage("newPlayer");
    instance.loadState(initialState);
    instance.currentPlayerId = id;
    console.log(initialState);
}