import ClientInstance from './ClientInstance';
import Gui from './Gui';
import { awaitWebSocketMessage } from './net';
import { render } from './renderer';

const instance = new ClientInstance();
const gui = new Gui(document.getElementById('gui') as HTMLDivElement, instance);

await init();

console.log('initialized');

render(instance, gui);

async function init() {
    const {id, initialState} = await awaitWebSocketMessage("newPlayer");
    instance.loadState(initialState);
    instance.currentPlayerId = id;
    console.log(initialState);
}