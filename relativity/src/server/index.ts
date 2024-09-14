import ServerInstance from "./ServerInstance";
import path from 'path';
import { getDefaultAction, Player } from "../common/common";
import { ClientConnectionPacket, NewPlayerPacket, NewTurnPacket } from "../common/api";
import { Matrix } from "../common/geometry";
import NetworkHandler from "./NetworkHandler";

const rootURI = path.resolve(__dirname, '..', '..');

if(!await Bun.file(path.join(rootURI, 'package.json')).exists())
    throw new Error(`package.json not found at ${rootURI}. Location resolution is incorrect.`);

console.log(`Running on port ${process.env.VITE_PORT}`);

if(!process.env.VITE_PORT) {
    throw new Error("VITE_PORT is not defined");
}

const port = parseInt(process.env.VITE_PORT);

const server = Bun.serve({
    port,
    async fetch(req, server) {
        if(server.upgrade(req)){
            return;
        }
        const url = new URL(req.url);
        if(req.method === 'GET'){
            const staticResource = Bun.file(path.join(rootURI, 'dist', url.pathname));
            const staticResourceIndex = Bun.file(path.join(rootURI, 'dist', url.pathname, 'index.html'));

            if (await staticResource.exists()) return new Response(staticResource);
            if (await staticResourceIndex.exists()) return new Response(staticResourceIndex);
        }
        return new Response('Invalid request', {
            status: 404,
        });
    },
    websocket: {
        async open(ws){
            ws.subscribe("newTurn");
            ws.subscribe("newPlayer");
            ws.subscribe("gameStart");
            ws.subscribe("playerReady");

            const initialTransform: Matrix = [
                1, 0, 0, 0,
                0, 1, 0, Math.random() * 2 - 1,
                0, 0, 1, Math.random() * 2 - 1,
                0, 0, 0, 1,
            ];
            const username = instance.getPlayerUid();
            const newPlayer: Player = {
                ready: false,
                id: username,
                history: [],
                finalState: {
                    transform: initialTransform,
                    matter: 1,
                    antimatter: 1,
                },
                minimumMatter: 0.5,
                currentAction: getDefaultAction(),
            };
            instance.addPlayer(newPlayer);
            const clientConnectionPacket: ClientConnectionPacket = {
                messageType: 'clientConnection',
                id: username,
                initialState: instance.data,
            };
            ws.send(JSON.stringify(clientConnectionPacket));

            const newPlayerPacket: NewPlayerPacket = {
                messageType: 'newPlayer',
                player: newPlayer,
            };
            server.publish('newPlayer', JSON.stringify(newPlayerPacket));
        },
        async message(ws, message){
            networkHandler.processMessage(message as string);
        },
    },
});

const networkHandler = new NetworkHandler(server);

const instance = new ServerInstance(networkHandler);

instance.play();
