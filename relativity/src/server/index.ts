import { build } from "vite";
import ServerInstance from "./ServerInstance";
import path from 'path'
import { Player } from "../common/common";
import { Server } from "bun";
import fs from 'fs'
import { NewPlayerRequest, NewPlayerResponse } from "../common/api";

const rootURI = path.resolve(__dirname, '..', '..')

fs.watch(path.join(rootURI, 'src'), {recursive: true}, async () => {
    await build()
})

const viteBuildResult = await build();

const instance = new ServerInstance()

if(!await Bun.file(path.join(rootURI, 'package.json')).exists())
    throw new Error(`package.json not found at ${rootURI}. Location resolution is incorrect.`)

const routes: Record<string, Record<string, (req: Request, server: Server) => Promise<Response>>> = {
    POST: {
        async "/api/newPlayer"(req, server){
            const newPlayerRequest: NewPlayerRequest = await req.json()
            const playerId = "test"
            const newPlayer: Player = {
                id: playerId,
                clientPosition: newPlayerRequest.starting,
                finalPosition: newPlayerRequest.starting,
                history:[],
                matter: 100,
                antimatter: 100,
            }
            instance.addPlayer(newPlayer)
            const newPlayerResponse: NewPlayerResponse = {
                id: playerId,
                initialState: instance.state
            }
            return new Response(JSON.stringify(newPlayerResponse))
        }
    }
}

Bun.serve({
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
            ws.subscribe("new-turn")
            console.log("hi")
        },
        async message(ws, message){
            const data = JSON.parse(message.toString())
            ws.send(JSON.stringify(data))
        }
    }
})
