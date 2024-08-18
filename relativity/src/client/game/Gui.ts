import { ActionType } from "../../common/common";
import ClientInstance from "./ClientInstance";

export default class Gui{
    mousePos = {x: 0, y: 0};

    pitchAngle = 0;
    yawAngle = 0;
    zoom = 1;

    currentActionIndex = 0;
    currentAction: ActionType = 'thrust';
    actionList: ActionType[] = ['thrust', 'laser', 'nuke'];

    timeSlider = document.getElementById("timeSlider") as HTMLInputElement;

    selectAction(index: number){
        this.currentActionIndex = (index % this.actionList.length + this.actionList.length) % this.actionList.length;
        this.currentAction = this.actionList[this.currentActionIndex];
        console.log(this.currentAction);
    }

    constructor(element: HTMLDivElement, clientInstance: ClientInstance){
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
            if(this.currentAction === 'thrust'){
                clientInstance.setAction({
                    actionType: 'thrust',
                    x: this.mousePos.x,
                    y: this.mousePos.y,
                });
            }
        });

        this.timeSlider.addEventListener("input", () => {
            clientInstance.clientProperTime = parseFloat(this.timeSlider.value);
            console.log(this.timeSlider.value);
        });

        window.addEventListener('keypress', event => {
            if(event.key === "w") this.pitchAngle -= 0.1;
            if(event.key === "s") this.pitchAngle += 0.1;
            if(event.key === "a") this.yawAngle += 0.1;
            if(event.key === "d") this.yawAngle -= 0.1;
            if(event.key === "z") this.zoom /= 1.1;
            if(event.key === "c") this.zoom *= 1.1;
        });
    }
}
