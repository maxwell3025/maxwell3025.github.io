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

while(true) {
    const packet = await awaitWebSocketMessage("newTurn");
    console.log("Applying new turn data");
    instance.loadState(packet.newState);
    for(let i = 0; i < 100; i++){
        console.log(instance.clientProperTime);
        instance.clientProperTime += 0.01;
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    instance.clientProperTime = Math.round(instance.clientProperTime);
}