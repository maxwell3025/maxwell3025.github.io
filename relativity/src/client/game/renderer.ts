import * as THREE from 'three';
import ClientInstance from './ClientInstance';
import { getPlayerPosition, getPlayerTransform, Player } from '../../common/common';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/Addons.js';
import { getOrigin, invert, Matrix, mul, Vector } from '../../common/geometry';
import Gui from './Gui';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 1;

const rendererDom = document.getElementById("rendererDom") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas: rendererDom });
renderer.setSize(window.innerWidth, window.innerHeight);

const labelRendererDom = document.getElementById("labelRendererDom") as HTMLDivElement;
const labelRenderer = new CSS2DRenderer({ element: labelRendererDom });
labelRenderer.setSize(window.innerWidth, window.innerHeight);

const pathRendererDom = document.getElementById("pathRenderer") as HTMLCanvasElement;
const pathRenderer = new THREE.WebGLRenderer({ canvas: pathRendererDom, alpha: true });
pathRenderer.setSize(400, 400);
const pathRendererCamera = new THREE.OrthographicCamera();
pathRendererCamera.position.z = 100;
const pathScene = new THREE.Scene();

const swapYZ = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 1).normalize(),
    Math.PI,
);

const constantRotation = new THREE.Quaternion();

function getRenderPosition(currentTransform: Matrix, player: Player): Vector | undefined{
    const inverseMatrix = invert(currentTransform);
    const PAST_EPSILON = 0.0001;
    function isPast(otherPosition: Vector): boolean {
        const inverted = mul(inverseMatrix, otherPosition);
        if(inverted.t > 0){
            return false;
        }
        return inverted.t * inverted.t - PAST_EPSILON > inverted.x * inverted.x + inverted.y * inverted.y;
    }

    const playerFinalPosition = mul(player.finalTransform, getOrigin());
    if(isPast(playerFinalPosition)) return undefined;

    let minTime = -1;
    let minTimePosition = getPlayerPosition(player, minTime);
    while(minTimePosition && !isPast(minTimePosition)){
        minTime *= 2;
        minTimePosition = getPlayerPosition(player, minTime);
    }

    let maxTime = 1;
    let maxTimePosition = getPlayerPosition(player, maxTime);
    while(maxTimePosition && isPast(maxTimePosition)){
        maxTime *= 2;
        maxTimePosition = getPlayerPosition(player, maxTime);
    }

    while(maxTime - minTime > 0.0001){
        const middleTime = (minTime + maxTime) * 0.5;
        const middleTimePosition = getPlayerPosition(player, middleTime);
        if(!middleTimePosition) {
            maxTime = middleTime;
            continue;
        }
        if(isPast(middleTimePosition)){
            minTime = middleTime;
        } else {
            maxTime = middleTime;
        }
    }
    const intersectionLocation = getPlayerPosition(player, minTime);
    if(intersectionLocation){
        return mul(inverseMatrix, intersectionLocation);
    } else {
        console.warn("This branch of execution should never occur");
        return undefined;
    }
}

function renderPlayers(instance: ClientInstance){
    const currentPlayer = instance.getCurrentPlayer();
    const currentPosition = getPlayerPosition(currentPlayer, instance.clientProperTime);
    const currentTransform = getPlayerTransform(currentPlayer, instance.clientProperTime);
    if(!currentPosition || !currentTransform){
        console.warn(`Invalid proper time ${instance.clientProperTime}`);
        console.warn(currentPlayer);
        return;
    }
    let numRenderedPlayers = 0;
    for(const player of instance.state.players){
        const renderPosition = getRenderPosition(currentTransform, player);
        if(!renderPosition){
            console.warn(`Client received player data for non-visible player with id = ${player.id}`);
            continue;
        }
        const absolutePosition = mul(currentTransform, renderPosition);

        const positionDiv = document.createElement('div');
        positionDiv.className = 'label';
        positionDiv.innerText = `t=${absolutePosition.t.toFixed(3)}
x=${absolutePosition.x.toFixed(3)}
y=${absolutePosition.y.toFixed(3)}`;
        const positionLabel = new CSS2DObject(positionDiv);
        positionLabel.position.x = renderPosition.x;
        positionLabel.position.y = renderPosition.y + 0.05;
        scene.add(positionLabel);

        const playerGeometry = new THREE.CircleGeometry(0.01);
        const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        playerMesh.position.x = renderPosition.x;
        playerMesh.position.y = renderPosition.y;
        scene.add(playerMesh);

        numRenderedPlayers++;
    }
}

function renderGui(instance: ClientInstance, gui: Gui){
    if(gui.currentAction === 'thrust'){
        const dir = new THREE.Vector3( gui.mousePos.x, gui.mousePos.y, 0 );
        dir.normalize();

        const origin = new THREE.Vector3( 0, 0, 0 );
        const length = Math.sqrt(gui.mousePos.x * gui.mousePos.x + gui.mousePos.y * gui.mousePos.y);
        const hex = 0xff0000;

        const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, 0.02, 0.03);
        scene.add( arrowHelper );
    }
    const action = instance.getCurrentPlayer().currentAction;
    if(action.actionType === 'thrust'){
        const dir = new THREE.Vector3( action.x, action.y, 0 );
        dir.normalize();

        const origin = new THREE.Vector3( 0, 0, 0 );
        const length = Math.sqrt(action.x * action.x + action.y * action.y);
        const hex = 0x00ff00;

        const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, 0.02, 0.03);
        scene.add( arrowHelper );
    }
}

function renderPaths(instance: ClientInstance){
    const currentPlayer = instance.getCurrentPlayer();
    const currentTransform = getPlayerTransform(currentPlayer, instance.clientProperTime);
    if(!currentTransform) return;
    constantRotation.multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.01),
    );
    for(const player of instance.state.players){
        const material = new THREE.LineBasicMaterial( { color: 0xffffff } );
        const points = [];
        let currentCoords: Vector | undefined;
        let currentProperTime = 0;
        while(currentCoords = getPlayerPosition(player, currentProperTime)){
            const currentCoordsRelative = mul(invert(currentTransform), currentCoords);
            points.push(new THREE.Vector3(
                currentCoordsRelative.x,
                currentCoordsRelative.y,
                currentCoordsRelative.t,
            ));
            currentProperTime += 0.1;
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        pathScene.add(line);
    }
}

function renderCones(){
    const geometry = new THREE.ConeGeometry( 1, 1, 32, 1, true);
    const material = new THREE.LineBasicMaterial({color: 0xffffff});
    const wireframe = new THREE.LineSegments(geometry, material);
    wireframe.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    wireframe.position.z = -0.5;
    pathScene.add(wireframe);
}

function renderLoop(instance: ClientInstance, gui: Gui) {
    scene.clear();
    pathScene.clear();
    pathScene.rotation.set(0, 0, 0);
    pathScene.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1),
        gui.yawAngle,
    ));
    pathScene.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        gui.pitchAngle,
    ));
    pathScene.applyQuaternion(swapYZ);

    pathRendererCamera.zoom = gui.zoom;
    pathRendererCamera.updateProjectionMatrix();

    renderPlayers(instance);
    renderGui(instance, gui);
    renderPaths(instance);
    renderCones();

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    pathRenderer.render(pathScene, pathRendererCamera);
}

export function render(instance: ClientInstance, gui: Gui) {
    renderer.setAnimationLoop(() => renderLoop(instance, gui));
}
