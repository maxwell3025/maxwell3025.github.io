import * as React from 'react';
import CircuitViewer from './CircuitViewer';
import GateMenu from './GateMenu';
import { QuantumGate, QuantumState } from './quantum';
import StateViewer from './StateViewer';

export default function CircuitEditor() {
  const stateHook = React.useRef((x: QuantumState) => {});
  const [gateList, setGateList] = React.useState<QuantumGate[]>([]);
  return (
    <div className="flex flex-col">
      <GateMenu setGateList={setGateList}></GateMenu>
      <div className="flex flex-row">
        <CircuitViewer initialWidth={3} gateList={gateList}></CircuitViewer>
        <StateViewer stateRef={stateHook}></StateViewer>
      </div>
    </div>
  );
}
