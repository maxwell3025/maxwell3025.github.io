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
    ready: boolean = false;

    timeSlider = document.getElementById("timeSlider") as HTMLInputElement;

    selectAction(index: number){
        this.currentActionIndex = (index % this.actionList.length + this.actionList.length) % this.actionList.length;
        this.currentAction = this.actionList[this.currentActionIndex];
        console.log(this.currentAction);
    }

    constructor(element: HTMLDivElement, clientInstance: ClientInstance){

        clientInstance.addNewTurnListener(async () => {
            this.timeSlider.max = clientInstance.maxProperTime + "";
            clientInstance.clientProperTime = clientInstance.maxProperTime - 1;
            for(let i = 0; i < 100; i++){
                console.log(clientInstance.clientProperTime);
                clientInstance.clientProperTime += 0.01;
                this.timeSlider.value = clientInstance.clientProperTime + "";
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            clientInstance.clientProperTime = clientInstance.maxProperTime;
        });

        element.addEventListener('mousemove', event => {
            const guiWidth = element.clientWidth;
            const guiHeight = element.clientHeight;
            const aspectRatio = guiWidth / guiHeight;
            this.mousePos.x = (event.clientX / guiWidth * 2 - 1) * aspectRatio;
            this.mousePos.y = event.clientY / guiHeight * -2 + 1;
        });

        element.addEventListener('wheel', event => {
            this.selectAction(this.currentActionIndex + event.deltaY / Math.abs(event.deltaY));
        });

        element.addEventListener('click', event => {
            if(clientInstance.data.state === 'active'){
                if(this.currentAction === 'thrust'){
                    clientInstance.setAction({
                        actionType: 'thrust',
                        x: this.mousePos.x * this.mainZoom,
                        y: this.mousePos.y * this.mainZoom,
                    });
                }
                if(this.currentAction === 'laser'){
                    const theta = Math.atan2(this.mousePos.y, this.mousePos.x);
                    clientInstance.setAction({
                        actionType: 'laser',
                        theta,
                    });
                }
            }
        });

        this.timeSlider.addEventListener("input", () => {
            clientInstance.clientProperTime = parseFloat(this.timeSlider.value);
            console.log(this.timeSlider.value);
        });

        window.addEventListener('keypress', event => {
            if(clientInstance.data.state === 'active'){
                if(event.key === "w") this.pitchAngle -= 0.1;
                if(event.key === "s") this.pitchAngle += 0.1;
                if(event.key === "a") this.yawAngle += 0.1;
                if(event.key === "d") this.yawAngle -= 0.1;
                if(event.key === "z") this.minimapZoom /= 1.1;
                if(event.key === "c") this.minimapZoom *= 1.1;
                if(event.key === "r") this.mainZoom /= 1.1;
                if(event.key === "v") this.mainZoom *= 1.1;
            }
            if(clientInstance.data.state === 'lobby'){
                if(event.key === "Enter") {
                    this.ready = !this.ready;
                    clientInstance.setReady(this.ready);
                    if(this.ready){
                        this.setStatusText('Ready');
                    } else {
                        this.setStatusText('Not Ready');
                    }
                }
            }
        });

        this.statusBanner = document.getElementById("statusBanner") as HTMLDivElement;
        if(!this.statusBanner) {
            throw new Error("#statusBanner not found");
        }
        this.setStatusText('Not Ready');
    }

    setStatusText(statusText: string){
        this.statusBanner.textContent = statusText;
    }
}
