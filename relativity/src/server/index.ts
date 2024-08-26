import { build } from "vite";
import ServerInstance from "./ServerInstance";
import path from 'path';
import { getDefaultAction } from "../common/common";
import { Server } from "bun";
import { ClientConnectionPacket, NewPlayerPacket, NewTurnPacket } from "../common/api";
import { getIdentity, Matrix, Vector } from "../common/geometry";
import { awaitWebSocketMessage, processMessage } from "./net";

const rootURI = path.resolve(__dirname, '..', '..');

await build();

const instance = new ServerInstance();

if(!await Bun.file(path.join(rootURI, 'package.json')).exists())
    throw new Error(`package.json not found at ${rootURI}. Location resolution is incorrect.`);

const routes: Record<string, Record<string, (req: Request, server: Server) => Promise<Response>>> = {
};

let currentUser = 0;
function getUsername(){
    return currentUser++ + "";
}

const server = Bun.serve({
    port: 8080,
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
        const handler = routes[req.method]?.[url.pathname];
        if(!handler) return new Response(`No API or file found for ${req.method} ${url.pathname}`, {status: 404});
        return handler(req, server);
    },
    websocket: {
        async open(ws){
            ws.subscribe("newTurn");
            ws.subscribe("newPlayer");

            const initialTransform: Matrix = [
                1, 0, 0, 0,
                0, 1, 0, Math.random() * 2 - 1,
                0, 0, 1, Math.random() * 2 - 1,
                0, 0, 0, 1,
            ];
            const username = getUsername();
            const newPlayer = {
                id: username,
                antimatter: 1,
                matter: 1,
                history: [],
                clientTransform: initialTransform,
                finalTransform: initialTransform,
                currentAction: getDefaultAction(),
            };
            instance.addPlayer(newPlayer);
            const clientConnectionPacket: ClientConnectionPacket = {
                messageType: 'clientConnection',
                id: username,
                initialState: instance.state,
            };
            ws.send(JSON.stringify(clientConnectionPacket));

            const newPlayerPacket: NewPlayerPacket = {
                messageType: 'newPlayer',
                player: newPlayer,
            };
            server.publish('newPlayer', JSON.stringify(newPlayerPacket));
        },
        async message(ws, message){
            processMessage(message as string);
        },
    },
});

// Handle change action packets
(async () => {
    while(true){
        const packet = await awaitWebSocketMessage("changeAction");
        console.log("Received changeAction packet");
        const player = instance.state.players.find(p => p.id === packet.playerId);
        if(!player){
            console.warn(`No player with id ${packet.playerId} found`);
            continue;
        }
        player.currentAction = packet.newAction;
    }
})();

process.stdout.write('> ');
for await (const line of console){
    console.log("Initiating new turn in 3 seconds...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    instance.evaluateTurn();

    const packet: NewTurnPacket = {
        messageType: "newTurn",
        newState: instance.state,
    };
    server.publish("newTurn", JSON.stringify(packet));
    process.stdout.write('> ');
}
