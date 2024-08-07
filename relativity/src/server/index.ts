import { build } from "vite";
import ServerInstance from "./ServerInstance";
import path from 'path'
import { Coord, Player } from "../common/common";
import { Server } from "bun";
import fs from 'fs'
import { NewPlayerPacket } from "../common/api";

const rootURI = path.resolve(__dirname, '..', '..')

fs.watch(path.join(rootURI, 'src'), {recursive: true}, async () => {
    await build()
})

const viteBuildResult = await build();

const instance = new ServerInstance()

if(!await Bun.file(path.join(rootURI, 'package.json')).exists())
    throw new Error(`package.json not found at ${rootURI}. Location resolution is incorrect.`)

const routes: Record<string, Record<string, (req: Request, server: Server) => Promise<Response>>> = {
}

const server = Bun.serve({
    port: 8080,
    async fetch(req, server) {
        if(server.upgrade(req)){
            return
        }
        const url = new URL(req.url)
        if(req.method === 'GET'){
            const staticResource = Bun.file(path.join(rootURI, 'dist', url.pathname))
            const staticResourceIndex = Bun.file(path.join(rootURI, 'dist', url.pathname, 'index.html'))

            if (await staticResource.exists()) return new Response(staticResource);
            if (await staticResourceIndex.exists()) return new Response(staticResourceIndex);
        }
        const handler = routes[req.method]?.[url.pathname]
        if(!handler) return new Response(`No API or file found for ${req.method} ${url.pathname}`, {status: 404})
        return handler(req, server)
    },
    websocket: {
        async open(ws){
            ws.subscribe("newTurn")
            const initialPosition: Coord = {t: 0, x: Math.random() * 2 - 1, y: Math.random() * 2 - 1}
            instance.addPlayer({
                id: 'ExamplePlayer',
                antimatter: 1,
                matter: 1,
                history: [],
                clientPosition: initialPosition,
                finalPosition: initialPosition,
            })
            const newPlayerPacket: NewPlayerPacket = {
                messageType: 'newPlayer',
                id: 'ExamplePlayer',
                initialState: instance.state
            }
            ws.send(JSON.stringify(newPlayerPacket))
        },
        async message(ws, message){
            const data = JSON.parse(message.toString())
            ws.send(JSON.stringify(data))
        }
    }
})

while(true){
    await new Promise(resolve => setTimeout(resolve, 10000))
    instance.evaluateTurn();
    server.publish("newTurn", JSON.stringify(instance.state))
}
