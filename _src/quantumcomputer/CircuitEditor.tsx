import * as React from 'react';
import CircuitViewer from './CircuitViewer';
import GateMenu from './GateMenu';
import { QuantumGate, QuantumState } from './quantum';
import StateViewer from './StateViewer';

export default function CircuitEditor(properties: { initialWidth: number }) {
  const [gateList, setGateList] = React.useState<QuantumGate[]>([]);
  const [inputState, setInputState] = React.useState<QuantumState>(
    new QuantumState(properties.initialWidth)
  );
  const [probePosition, setProbePosition] = React.useState<number>(0);

  let displayedState = inputState.clone();
  gateList.slice(0, probePosition).forEach(gate => {
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
          initialWidth={properties.initialWidth}
          gateList={gateList}
          probePosition={probePosition}
          setProbePosition={setProbePosition}
        ></CircuitViewer>
        <StateViewer state={displayedState}></StateViewer>
      </div>
    </div>
  );
}
