import ClientInstance from './ClientInstance';
import { NewPlayerRequest, NewPlayerResponse } from '../../common/api';
import { render } from './renderer';

const params = new URLSearchParams(window.location.search);

const instance = new ClientInstance();

const socket = new WebSocket("ws://localhost:8080");

await init();

console.log('initialized')

render(instance);

async function init() {
    const requestBody: NewPlayerRequest = {
        starting: {
            x: Math.random() - 0.5,
            y: Math.random() - 0.5,
            t: 0,
        },
    }
    const response = await fetch('/api/newPlayer', {
        method: 'POST',
        body: JSON.stringify(requestBody),
    })
    const responseBody = await response.json() as NewPlayerResponse

    instance.loadState(responseBody.initialState)
    instance.currentPlayerId = responseBody.id
}