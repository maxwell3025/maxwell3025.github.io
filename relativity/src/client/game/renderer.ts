import * as THREE from 'three';
import ClientInstance from './ClientInstance';
import { Coord, getSpacetimePosition, Player } from '../../common/common';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 1;

function getRenderPosition(currentPosition: Coord, player: Player): Coord | undefined{
    function isPast(otherPosition: Coord): boolean {
        if(otherPosition.t < currentPosition.t){
            return false;
        }
        return (currentPosition.x - otherPosition.x) * (currentPosition.x - otherPosition.x) +
        (currentPosition.y - otherPosition.y) * (currentPosition.y - otherPosition.y) <
        (currentPosition.t - otherPosition.t) * (currentPosition.t - otherPosition.t)
    }
    if(isPast(player.nextPosition)) return undefined
    let minTime = 0;
    let maxTime = 1;
    let maxTimePosition = getSpacetimePosition(player, maxTime)
    while(maxTimePosition && isPast(maxTimePosition)){
        maxTime *= 2
        maxTimePosition = getSpacetimePosition(player, maxTime)
    }

    while(maxTime - minTime > 0.01){
        const middleTime = (minTime + maxTime) * 0.5
        const middleTimePosition = getSpacetimePosition(player, middleTime)
        if(!middleTimePosition) {
            maxTime = middleTime
            continue
        }
        if(isPast(middleTimePosition)){
            minTime = middleTime
        } else {
            maxTime = middleTime
        }
    }
    const intersectionLocation = getSpacetimePosition(player, minTime)
    return intersectionLocation
}

function renderLoop(instance: ClientInstance) {
    scene.clear();
    const currentPlayer = instance.getCurrentPlayer()
    let numRenderedPlayers = 0;
    for(const player of instance.state.players){
        const renderPosition = getRenderPosition(currentPlayer.currentPosition, player)
        if(!renderPosition)
            throw new Error(`Client received player data for non-visible player with id = ${player.id}`)
        const playerGeometry = new THREE.CircleGeometry(0.01);
        const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        playerMesh.position.x = renderPosition.x
        playerMesh.position.y = renderPosition.y
        scene.add(playerMesh)
        numRenderedPlayers++
    }
    console.log(`Rendered ${numRenderedPlayers} players`)
    renderer.render(scene, camera);
}

export function render(instance: ClientInstance) {
    renderer.setAnimationLoop(() => renderLoop(instance));
}
