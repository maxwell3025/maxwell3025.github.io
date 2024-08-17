import { build } from "vite";
import ServerInstance from "./ServerInstance";
import path from 'path';
import { getDefaultAction } from "../common/common";
import { Server } from "bun";
import { NewPlayerPacket } from "../common/api";
import { getIdentity, Matrix, Vector } from "../common/geometry";
import { processMessage } from "./net";

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
            ws.subscribe("mapUpdate");

            const initialTransform: Matrix = [
                1, 0, 0, 0,
                0, 1, 0, Math.random() * 2 - 1,
                0, 0, 1, Math.random() * 2 - 1,
                0, 0, 0, 1,
            ];
            const username = getUsername();
            instance.addPlayer({
                id: username,
                antimatter: 1,
                matter: 1,
                history: [],
                clientTransform: initialTransform,
                finalTransform: initialTransform,
                currentAction: getDefaultAction(),
            });
            const newPlayerPacket: NewPlayerPacket = {
                messageType: 'newPlayer',
                id: username,
                initialState: instance.state,
            };
            ws.send(JSON.stringify(newPlayerPacket));
        },
        async message(ws, message){
            processMessage(message as string);
        },
    },
});

process.stdout.write('> ');
for await (const line of console){
    instance.evaluateTurn();

    server.publish("newTurn", JSON.stringify(instance.state));
    process.stdout.write('> ');
}
