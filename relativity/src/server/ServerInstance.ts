import { getNextEntry, getPlayerTransform, type GameData, type HistoryEntry, type Player } from "../common/common";
import { TriangleMesh, mul, Vector } from "../common/geometry";
import NetworkHandler from "./NetworkHandler";

export default class ServerInstance {
    data: GameData = {
        players: [],
        lasers: [],
        state: "lobby",
    };
    networkHandler: NetworkHandler;
    currentId = 0;

    constructor(networkHandler: NetworkHandler) {
        this.networkHandler = networkHandler;
    }

    /**
     * Returns a new id that is unique within this server.
     */
    getPlayerUid(){
        this.currentId++;
        return `${this.currentId}`;
    }

    censor(position: Vector): GameData {
        return structuredClone(this.data);
    }
    addPlayer(player: Player) {
        this.data.players.push(player);
    }
    async queuePlayers(){
        return new Promise<void>(resolve => {
            const readyListener = this.networkHandler.addPacketListener('playerReady', (packet) => {
                console.log("Received playerReady packet");
                const player = this.data.players.find(p => p.id === packet.playerId);
                if(!player){
                    console.warn(`No player with id ${packet.playerId} found`);
                    return;
                }
                player.ready = packet.ready;
                if(this.data.players.every(player => player.ready)){
                    this.data.state = 'active';
                    this.networkHandler.publish('gameStart', {
                        messageType: 'gameStart',
                        newState: this.data,
                    });
                    readyListener.close();
                    resolve();
                }
            });
        });
    }

    evaluateTurn() {
        // TODO filter to only apply rules to players that can move ahead
        this.data.players.forEach(player => {
            const currentEntry: HistoryEntry = {
                transform: player.finalTransform,
                action: player.currentAction,
            };
            const dataNext = getNextEntry(currentEntry);
            player.history.push(currentEntry);
            player.finalTransform = dataNext.transform;
            player.clientTransform = dataNext.transform;
            player.currentAction = dataNext.action;

            if(currentEntry.action.actionType === "laser"){
                const theta = currentEntry.action.theta;
                const originalTime = player.history.length - 1;
                const divisions = 1;
                const laserLength = 10;
                /** This is the surface in spacetime that the laser sweep forms */
                const laserMesh: TriangleMesh = {
                    points: [],
                    triangles: [],
                };
                // These are the corners of the quadrilateral "fan blade" of the laser sweep.
                /** Present, close to player*/
                let A: Vector | undefined = undefined;
                /** Present, far from player*/
                let B: Vector | undefined = undefined;
                /** Past, far from player*/
                let C: Vector | undefined = undefined;
                /** Past, close to player*/
                let D: Vector | undefined = undefined;

                for(let slice = 0; slice <= divisions; slice++){
                    const time = originalTime + slice / divisions;
                    const currentTransform = getPlayerTransform(player, time);
                    if(!currentTransform) break;

                    D = A;
                    C = B;
                    A = mul(currentTransform, {t: 0, x: 0, y: 0});
                    B = mul(currentTransform, {
                        t: laserLength,
                        x: laserLength * Math.cos(theta),
                        y: laserLength * Math.sin(theta),
                    });

                    laserMesh.points.push(A);
                    laserMesh.points.push(B);

                    if(A && B && C && D) {
                        const pointCount = laserMesh.points.length;
                        const indexA = pointCount - 2;
                        const indexB = pointCount - 1;
                        const indexC = pointCount - 3;
                        const indexD = pointCount - 4;

                        laserMesh.triangles.push([indexA, indexB, indexC]);
                        laserMesh.triangles.push([indexD, indexA, indexC]);
                    }
                }
                this.data.lasers.push(laserMesh);
            }
        });
        console.log("Evaluating new turn");
    }

    async play() {
        // Wait for players
        await this.queuePlayers();
        console.log("Finished queuing!");

        this.networkHandler.addPacketListener('changeAction', packet => {
            console.log("Received changeAction packet");
            const player = this.data.players.find(p => p.id === packet.playerId);
            if(!player){
                console.warn(`No player with id ${packet.playerId} found`);
                return;
            }
            player.currentAction = packet.newAction;
        });

        while(true){
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.evaluateTurn();

            this.networkHandler.publish("newTurn", {
                messageType: "newTurn",
                newState: this.data,
            });
        }
    }
}