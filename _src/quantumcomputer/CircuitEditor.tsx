import * as React from 'react';
import CircuitViewer from './CircuitViewer';
import GateMenu from './GateMenu';
import { QuantumGate, QuantumState } from './quantum';
import StateViewer from './StateViewer';

export default function CircuitEditor(properties: { initialWidth: number }) {
  const [gateList, setGateList] = React.useState<[number, QuantumGate][]>([]);
  const [inputState, setInputState] = React.useState<QuantumState>(
    new QuantumState(properties.initialWidth)
  );
  const [probePosition, setProbePosition] = React.useState<number>(0);

  let displayedState = inputState.clone();
  let prevGates = gateList.filter(a => a[0] < probePosition).sort((a, b) => a[0] - b[0]).map(a => a[1])
  prevGates.forEach(gate => {
    displayedState = displayedState.genericGate(
      gate.targets,
      gate.coefficients
    );
  });

  return (
    <div className="flex h-96 flex-col">
      <GateMenu setGateList={setGateList}></GateMenu>
      <div className="flex flex-grow flex-row items-stretch">
        <CircuitViewer
          numBits={properties.initialWidth}
          numColumns ={4}
          gateList={gateList}
          probePosition={probePosition}
          setProbePosition={setProbePosition}
        ></CircuitViewer>
        <StateViewer state={displayedState}></StateViewer>
      </div>
    </div>
  );
}
