import * as React from "react";
import { CircuitViewer } from "./CircuitViewer";
import { GateMenu } from "./GateMenu";
import { QuantumState } from "./quantum";
import { StateViewer } from "./StateViewer";

export default function CircuitEditor(){
    const stateHook = React.useRef((x: QuantumState) => {})
    return <div className="flex flex-col">
        <GateMenu></GateMenu>
        <div className="flex flex-row">
            <StateViewer stateRef={stateHook}></StateViewer>
            <CircuitViewer></CircuitViewer>
        </div>
    </div>
}