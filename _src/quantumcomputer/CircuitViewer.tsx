import * as React from 'react';
import GateIcon from './GateIcon';
import { QuantumGate } from './quantum';

export default function CircuitViewer(properties: { initialWidth: number, gateList: QuantumGate[]}) {
  const [bitCount, setBitCount] = React.useState<number>(
    properties.initialWidth
  );
  const numColumns = Math.max(properties.gateList.length + 1);
  const numRows = bitCount;
  let wireIcons = [];
  for (let row = 0; row < numRows; row++) {
    wireIcons.push(
      <line
        key={`${row}`}
        className="stroke-white"
        strokeWidth="1px"
        vectorEffect="non-scaling-stroke"
        x1={0}
        y1={row * 100 + 50}
        x2={numColumns * 100 + 100}
        y2={row * 100 + 50}
      ></line>
    );
  }
  properties.gateList.forEach((gate, column) => {
    let min = gate.targets.reduce((a, b) => Math.min(a, b))
    let max = gate.targets.reduce((a, b) => Math.max(a, b))
    wireIcons.push(
      <line
        key={`column ${column}, rows ${min}-${max}`}
        className="stroke-white"
        strokeWidth="1px"
        vectorEffect="non-scaling-stroke"
        x1={column * 100 + 50}
        y1={min * 100 + 50}
        x2={column * 100 + 50}
        y2={max * 100 + 50}
      ></line>
    );
  });

  return (
    <div className="relative flex-grow">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${numColumns * 100} ${numRows * 100}`}
        preserveAspectRatio="none"
      >
        {wireIcons}
      </svg>
      <div
        className="col absolute inset-0 grid h-full w-full"
        style={{
          grid: `repeat(${numColumns}, minmax(0, 1fr)) / repeat(${numRows}, minmax(0, 1fr))`,
        }}
      ></div>
    </div>
  );
}
