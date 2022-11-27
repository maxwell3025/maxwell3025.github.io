import * as React from 'react';
import CircuitDisplay from './CircuitDisplay';
import ControlPanel from './ControlPanel';
import { QuantumGate, QuantumState } from './quantum';
import StateDisplay from './StateDisplay';

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
      <ControlPanel setGateList={setGateList}></ControlPanel>
      <div className="flex flex-grow flex-row items-stretch">
        <CircuitDisplay
          numBits={properties.initialWidth}
          numColumns ={4}
          gateList={gateList}
          probePosition={probePosition}
          setProbePosition={setProbePosition}
        ></CircuitDisplay>
        <StateDisplay state={displayedState}></StateDisplay>
      </div>
    </div>
  );
}
