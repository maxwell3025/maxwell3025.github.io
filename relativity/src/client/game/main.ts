import ClientInstance from './ClientInstance';
import { awaitWebSocketMessage } from './net';
import { render } from './renderer';

const instance = new ClientInstance();

await init();

console.log('initialized');

render(instance);

async function init() {
    const {id, initialState} = await awaitWebSocketMessage("newPlayer");
    instance.loadState(initialState);
    instance.currentPlayerId = id;
    console.log(initialState);
}