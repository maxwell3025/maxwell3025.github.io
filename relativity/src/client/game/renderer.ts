import * as THREE from 'three';
import ClientInstance from './ClientInstance';
import { getPlayerPosition, getPlayerTransform, Player } from '../../common/common';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/Addons.js';
import { getOrigin, invert, Matrix, mul, Vector } from '../../common/geometry';
import Gui from './Gui';


//#region setting up renderers and cameras
const flatRendererDom = document.getElementById("rendererDom") as HTMLCanvasElement;
const flatRenderer = new THREE.WebGLRenderer({ canvas: flatRendererDom });
flatRenderer.setSize(window.innerWidth, window.innerHeight);

/** This is the scene with everything rendered in 2-D and that represents what the crew would see */
const flatScene = new THREE.Scene();
const flatCamera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
flatCamera.position.z = 1;

const labelRendererDom = document.getElementById("labelRendererDom") as HTMLDivElement;
const labelRenderer = new CSS2DRenderer({ element: labelRendererDom });
labelRenderer.setSize(window.innerWidth, window.innerHeight);

const fullRendererDom = document.getElementById("pathRenderer") as HTMLCanvasElement;
const fullRenderer = new THREE.WebGLRenderer({ canvas: fullRendererDom, alpha: true });
fullRenderer.setSize(400, 400);

/** This is the scene with 3-D paths and everything rendered in 3-D spacetime*/
const fullScene = new THREE.Scene();
const fullCamera = new THREE.PerspectiveCamera(90);
fullCamera.position.z = 1;
//#endregion

/** Applies zooms and rotations to the scenes */
function applyTransformations(gui: Gui){
    /** This swaps the y and z axes */
    const swapYZ = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 1).normalize(),
        Math.PI,
    );

    fullScene.rotation.set(0, 0, 0);
    fullScene.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1),
        gui.yawAngle,
    ));
    fullScene.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        gui.pitchAngle,
    ));
    fullScene.applyQuaternion(swapYZ);

    fullCamera.position.z = gui.minimapZoom;
    fullCamera.near = gui.minimapZoom * 0.001;
    fullCamera.updateProjectionMatrix();

    flatCamera.position.z = gui.mainZoom;
}

/**
 * Gets the position to render the given player in the given frame of reference
 * In other words, this is where `player`'s spacetime path intersects with our past cone
 * The returned coordinate is in the frame-of-reference of `currentTransform`
 * @param currentTransform The frame-of-reference in which we are rendering
 * @param player Player to be rendered
 * @returns 
 */
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

/**
 * This renders all of the players on the main scene
 * @param instance 
 * @returns 
 */
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
        flatScene.add(positionLabel);

        const playerGeometry = new THREE.CircleGeometry(0.01);
        const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        playerMesh.position.x = renderPosition.x;
        playerMesh.position.y = renderPosition.y;
        flatScene.add(playerMesh);

        numRenderedPlayers++;
    }
}

/**
 * This renders the current action being selected in the GUI(i.e. not the one stored in the server) onto the main scene
 * @param instance 
 * @param gui 
 */
function renderCurrentAction(gui: Gui) {
    if(gui.currentAction === 'thrust'){
        const dir = new THREE.Vector3( gui.mousePos.x, gui.mousePos.y, 0 );
        dir.normalize();

        const origin = new THREE.Vector3( 0, 0, 0 );
        const length = Math.sqrt(gui.mousePos.x * gui.mousePos.x + gui.mousePos.y * gui.mousePos.y) * gui.mainZoom;
        const hex = 0xff0000;

        const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, 0.02, 0.03);
        flatScene.add( arrowHelper );
    }
    if(gui.currentAction === 'laser'){
        const dir = new THREE.Vector3( gui.mousePos.x, gui.mousePos.y, 0 );
        dir.normalize();

        const laserGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(gui.mousePos.x, gui.mousePos.y, 0),
        ]);
        const laserMaterial = new THREE.LineBasicMaterial( { color: 0xff0000 } );
        const laserObject = new THREE.Line(laserGeometry, laserMaterial);

        flatScene.add(laserObject);
    }
}

/**
 * This renders the currently selected action(already sent to the server) onto the main scene.
 * @param instance 
 * @param gui 
 */
function renderSelectedAction(instance: ClientInstance) {
    const action = instance.getCurrentPlayer().currentAction;
    if(action.actionType === 'thrust'){
        const dir = new THREE.Vector3( action.x, action.y, 0 );
        dir.normalize();

        const origin = new THREE.Vector3( 0, 0, 0 );
        const length = Math.sqrt(action.x * action.x + action.y * action.y);
        const hex = 0x00ff00;

        const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, 0.02, 0.03);
        flatScene.add( arrowHelper );
    }
    if(action.actionType === 'laser'){
        const laserGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(Math.cos(action.theta), Math.sin(action.theta), 0),
        ]);
        const laserMaterial = new THREE.LineBasicMaterial( { color: 0xff0000 } );
        const laserObject = new THREE.Line(laserGeometry, laserMaterial);

        flatScene.add(laserObject);

    }
}

/**
 * This renders all of the GUI related graphics
 * @param instance 
 * @param gui 
 */
function renderGui(gui: Gui){
    renderCurrentAction(gui);
}

/**
 * Renders the spacetime paths in the path scene
 * @param instance 
 * @returns 
 */
function renderPaths(instance: ClientInstance){
    const inverseTransform = instance.getCurrentInverseTransform();
    if(!inverseTransform) return;
    for(const player of instance.state.players){
        const material = new THREE.LineBasicMaterial( { color: 0xffffff } );
        const points = [];
        let currentCoords: Vector | undefined;
        let currentProperTime = 0;
        while(currentCoords = getPlayerPosition(player, currentProperTime)){
            const currentCoordsRelative = mul(inverseTransform, currentCoords);
            points.push(new THREE.Vector3(
                currentCoordsRelative.x,
                currentCoordsRelative.y,
                currentCoordsRelative.t,
            ));
            currentProperTime += 0.1;
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        fullScene.add(line);
    }
}

/**
 * Renders the lasers in the path scene
 * @param instance 
 * @returns 
 */
function renderLasers(instance: ClientInstance){
    const inverseTransform = instance.getCurrentInverseTransform();
    if(!inverseTransform) return;
    const laserMaterial = new THREE.LineBasicMaterial( { color: 0xff0000 } );
    instance.state.lasers.forEach(laserMesh => {
        const laserGeometry = new THREE.BufferGeometry();
        const vertexData = laserMesh.points.map(vector => mul(inverseTransform, vector)).flatMap(vector => [vector.x, vector.y, vector.t]);
        laserGeometry.setIndex(laserMesh.triangles.flat());
        laserGeometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(vertexData), 3 ) );
        fullScene.add(new THREE.LineSegments(
            new THREE.WireframeGeometry(laserGeometry),
            laserMaterial,
        ));
    });
}

/**
 * Renders the past cone in the path scene
 */
function renderCones(){
    const geometry = new THREE.ConeGeometry( 1, 1, 32, 1, true);
    const material = new THREE.LineBasicMaterial({color: 0xffffff});
    const wireframe = new THREE.LineSegments(geometry, material);
    wireframe.setRotationFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    wireframe.position.z = -0.5;
    fullScene.add(wireframe);
}

/**
 * The render loop
 * @param instance 
 * @param gui 
 */
function renderLoop(instance: ClientInstance, gui: Gui) {
    flatScene.clear();
    fullScene.clear();

    applyTransformations(gui);
    
    renderPlayers(instance);
    renderSelectedAction(instance);
    renderGui(gui);

    renderPaths(instance);
    renderLasers(instance);
    renderCones();

    flatRenderer.render(flatScene, flatCamera);
    labelRenderer.render(flatScene, flatCamera);
    fullRenderer.render(fullScene, fullCamera);
}

export function render(instance: ClientInstance, gui: Gui) {
    flatRenderer.setAnimationLoop(() => renderLoop(instance, gui));
}
