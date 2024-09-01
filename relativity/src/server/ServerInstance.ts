import { getNextEntry, getPlayerTransform, type GameData, type HistoryEntry, type Player } from "../common/common";
import { TriangleMesh, mul, Vector } from "../common/geometry";

export default class ServerInstance {
    data: GameData = {
        players: [],
        lasers: [],
        state: "lobby",
    };
    censor(position: Vector): GameData {
        return structuredClone(this.data);
    }
    addPlayer(player: Player) {
        this.data.players.push(player);
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
}