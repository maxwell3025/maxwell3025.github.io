import * as THREE from 'three';
import ClientInstance from './ClientInstance';
import { Coord, getSpacetimePosition, Player } from '../../common/common';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/Addons.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.id = 'rendererDom'
document.body.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.id = 'labelRendererDom'
document.body.appendChild(labelRenderer.domElement);

camera.position.z = 1;

function getRenderPosition(currentPosition: Coord, player: Player): Coord | undefined{
    function isPast(otherPosition: Coord): boolean {
        if(otherPosition.t > currentPosition.t){
            return false;
        }
        return (currentPosition.x - otherPosition.x) * (currentPosition.x - otherPosition.x) +
        (currentPosition.y - otherPosition.y) * (currentPosition.y - otherPosition.y) <
        (currentPosition.t - otherPosition.t) * (currentPosition.t - otherPosition.t)
    }
    if(isPast(player.finalPosition)) return undefined

    let minTime = -1;
    let minTimePosition = getSpacetimePosition(player, minTime)
    while(minTimePosition && !isPast(minTimePosition)){
        minTime *= 2
        minTimePosition = getSpacetimePosition(player, minTime)
    }

    let maxTime = 1;
    let maxTimePosition = getSpacetimePosition(player, maxTime)
    while(maxTimePosition && isPast(maxTimePosition)){
        maxTime *= 2
        maxTimePosition = getSpacetimePosition(player, maxTime)
    }

    while(maxTime - minTime > 0.0001){
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
        const renderPosition = getRenderPosition(currentPlayer.clientPosition, player)
        if(!renderPosition){
            console.warn(`Client received player data for non-visible player with id = ${player.id}`)
            continue
        }

        const positionDiv = document.createElement('div')
        positionDiv.className = 'label'
        positionDiv.innerText = `${renderPosition.t.toFixed(3)}, ${renderPosition.x.toFixed(3)}, ${renderPosition.y.toFixed(3)}`
        const positionLabel = new CSS2DObject(positionDiv)
        positionLabel.position.x = renderPosition.x
        positionLabel.position.y = renderPosition.y + 0.03
        scene.add(positionLabel)

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
    labelRenderer.render(scene, camera);
}

export function render(instance: ClientInstance) {
    renderer.setAnimationLoop(() => renderLoop(instance));
}
