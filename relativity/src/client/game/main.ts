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
    const {id, initialState} = await awaitWebSocketMessage("clientConnection");
    instance.loadState(initialState);
    instance.currentPlayerId = id;
    console.log(initialState);
}

(async () => {
    while(true){
        const packet = await awaitWebSocketMessage('newPlayer');
        console.log('New player joined');
        console.log(packet.player);
        if(packet.player.id !== instance.currentPlayerId)
        instance.state.players.push(packet.player);
    }
})();

while(true) {
    const packet = await awaitWebSocketMessage("newTurn");
    console.log("Applying new turn data");
    instance.loadState(packet.newState);
    instance.maxProperTime++;
    gui.timeSlider.max = instance.maxProperTime + "";
    for(let i = 0; i < 100; i++){
        console.log(instance.clientProperTime);
        instance.clientProperTime += 0.01;
        gui.timeSlider.value = instance.clientProperTime + "";
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    instance.clientProperTime = Math.round(instance.clientProperTime);
}