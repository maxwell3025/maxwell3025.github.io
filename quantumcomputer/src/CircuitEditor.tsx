import * as React from 'react';
import CircuitDisplay from './CircuitDisplay';
import ControlPanel from './ControlPanel';
import { QuantumGate, QuantumState } from './quantum';
import StateDisplay from './StateDisplay';

export default function CircuitEditor(properties: {
  initialWidth: number;
  initialColumnCount: number;
}) {
  const [gateList, setGateList] = React.useState<[number, QuantumGate][]>([]);
  const [probePosition, setProbePosition] = React.useState<number>(0);
  const [columnCount, setColumnCount] = React.useState<number>(
    properties.initialColumnCount
  );
  const [bitCount, setBitCount] = React.useState<number>(
    properties.initialWidth
  );

  let displayedState = new QuantumState(bitCount);
  let prevGates = gateList
    .filter(a => a[0] < probePosition)
    .sort((a, b) => a[0] - b[0])
    .map(a => a[1]);
  prevGates.forEach(gate => {
    displayedState = displayedState.genericGate(
      gate.targets,
      gate.coefficients
    );
  });

  return (
    <div className="flex h-96 flex-col">
      <ControlPanel
        setGateList={setGateList}
        columnCount={columnCount}
        bitCount={bitCount}
        setColumnCount={setColumnCount}
        setBitCount={setBitCount}
      ></ControlPanel>
      <div className="flex flex-grow flex-row items-stretch">
        <CircuitDisplay
          numBits={bitCount}
          numColumns={columnCount}
          gateList={gateList}
          probePosition={probePosition}
          setProbePosition={setProbePosition}
        ></CircuitDisplay>
        <StateDisplay state={displayedState}></StateDisplay>
      </div>
    </div>
  );
}
