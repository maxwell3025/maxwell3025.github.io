import ClientInstance from './ClientInstance';
import Gui from './Gui';
import NetworkHandler from './NetworkHandler';
import { render } from './renderer';

console.log(import.meta.env.VITE_WS_URL);
if(!import.meta.env.VITE_WS_URL) {
    throw new Error('VITE_WS_URL is undefined');
}

const socket = new WebSocket(import.meta.env.VITE_WS_URL);

const networkHandler = new NetworkHandler(socket);

const instance = new ClientInstance(networkHandler);

await instance.init();

const gui = new Gui(document.getElementById('gui') as HTMLDivElement, instance);


console.log('initialized');

render(instance, gui);
