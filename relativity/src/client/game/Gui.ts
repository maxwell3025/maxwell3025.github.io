import { ActionType } from "../../common/common";
import ClientInstance from "./ClientInstance";

export default class Gui{
    mousePos = {x: 0, y: 0};

    currentActionIndex = 0;
    currentAction: ActionType = 'thrust';
    actionList: ActionType[] = ['thrust', 'laser', 'nuke'];

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
    }
}
