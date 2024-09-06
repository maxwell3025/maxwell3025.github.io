import { ActionType } from "../../common/common";
import ClientInstance from "./ClientInstance";

export default class Gui{
    mousePos = {x: 0, y: 0};

    pitchAngle = 0;
    yawAngle = 0;
    minimapZoom = 1;
    mainZoom = 1;

    currentActionIndex = 0;
    currentAction: ActionType = 'thrust';
    actionList: ActionType[] = ['thrust', 'laser', 'nuke'];

    statusBanner: HTMLDivElement;
    weaponHotbar: HTMLDivElement;

    ready: boolean = false;

    timeSlider = document.getElementById("timeSlider") as HTMLInputElement;

    instance: ClientInstance;

    constructor(element: HTMLDivElement, clientInstance: ClientInstance){
        this.instance = clientInstance;

        this.instance.addNewTurnListener(() => this.handleNewTurn());

        this.instance.addPlayerReadyListener(() => this.updateStatusBanner());

        this.instance.addNewPlayerListener(() => this.updateStatusBanner());

        element.addEventListener('mousemove', event => {
            const guiWidth = element.clientWidth;
            const guiHeight = element.clientHeight;
            const aspectRatio = guiWidth / guiHeight;
            this.mousePos.x = (event.clientX / guiWidth * 2 - 1) * aspectRatio;
            this.mousePos.y = event.clientY / guiHeight * -2 + 1;
        });

        element.addEventListener('wheel', event => {
            this.selectAction(this.currentActionIndex + event.deltaY / Math.abs(event.deltaY));
            this.updateWeaponHotbar();
        });

        element.addEventListener('click', event => {
            if(this.instance.data.state === 'active'){
                if(this.currentAction === 'thrust'){
                    this.instance.setAction({
                        actionType: 'thrust',
                        x: this.mousePos.x * this.mainZoom,
                        y: this.mousePos.y * this.mainZoom,
                    });
                }
                if(this.currentAction === 'laser'){
                    const theta = Math.atan2(this.mousePos.y, this.mousePos.x);
                    this.instance.setAction({
                        actionType: 'laser',
                        theta,
                    });
                }
            }
        });

        this.timeSlider.addEventListener("input", () => {
            this.instance.clientProperTime = parseFloat(this.timeSlider.value);
            console.log(this.timeSlider.value);
        });

        window.addEventListener('keypress', event => {
            if(this.instance.data.state === 'active'){
                if(event.key === "w") this.pitchAngle -= 0.1;
                if(event.key === "s") this.pitchAngle += 0.1;
                if(event.key === "a") this.yawAngle += 0.1;
                if(event.key === "d") this.yawAngle -= 0.1;
                if(event.key === "z") this.minimapZoom /= 1.1;
                if(event.key === "c") this.minimapZoom *= 1.1;
                if(event.key === "r") this.mainZoom /= 1.1;
                if(event.key === "v") this.mainZoom *= 1.1;
            }
            if(this.instance.data.state === 'lobby'){
                if(event.key === "Enter") {
                    this.ready = !this.ready;
                    this.instance.setReady(this.ready);
                }
            }
        });

        this.statusBanner = document.getElementById("statusBanner") as HTMLDivElement;
        if(!this.statusBanner) {
            throw new Error("#statusBanner not found");
        }
        this.weaponHotbar = document.getElementById("weaponHotbar") as HTMLDivElement;
        if(!this.weaponHotbar) {
            throw new Error("#weaponHotbar not found");
        }

        for(const child of this.weaponHotbar.children){
            (child as HTMLElement).addEventListener('click', () => {
                this.currentAction = child.id as ActionType;
                this.currentActionIndex = this.actionList.indexOf(this.currentAction);
                this.updateWeaponHotbar();
            });
        }

        this.updateWeaponHotbar();
        this.updateStatusBanner();
    }

    async handleNewTurn(){
        this.timeSlider.max = this.instance.maxProperTime + "";
        this.instance.clientProperTime = this.instance.maxProperTime - 1;
        for(let i = 0; i < 99; i++){
            this.instance.clientProperTime += 0.01;
            this.timeSlider.value = this.instance.clientProperTime + "";
            console.log(this.instance.clientProperTime);
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        this.instance.clientProperTime = this.instance.maxProperTime;
        this.timeSlider.value = this.instance.clientProperTime + "";
        console.log(this.instance.clientProperTime);
    }

    updateStatusBanner(){
        while(this.statusBanner.firstChild){
            this.statusBanner.removeChild(this.statusBanner.firstChild);
        }

        this.instance.data.players.forEach(player => {
            const playerStatus = document.createElement('div');
            playerStatus.textContent = `${player.id}: ${player.ready}`;
            if(player.id === this.instance.currentPlayerId){
                playerStatus.style.color = "#ff0000";
            }
            this.statusBanner.appendChild(playerStatus);
        });
    }

    updateWeaponHotbar(){
        for(const child of this.weaponHotbar.children){
            if(this.currentAction === child.id){
                (child as HTMLElement).style.border = "4px solid red";
            } else {
                (child as HTMLElement).style.border = "none";
            }
        }
    }

    selectAction(index: number){
        this.currentActionIndex = (index % this.actionList.length + this.actionList.length) % this.actionList.length;
        this.currentAction = this.actionList[this.currentActionIndex];
        console.log(this.currentAction);
    }
}
