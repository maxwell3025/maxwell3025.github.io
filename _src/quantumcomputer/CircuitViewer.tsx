import * as React from 'react';
import { QuantumGate } from './quantum';
import Hadamard from './icons/Hadamard';
import Swap from './icons/Swap';

export default function CircuitViewer(properties: {
  initialWidth: number;
  gateList: QuantumGate[];
}) {
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
  let gateIcons = [];
  properties.gateList.forEach((gate, column) => {
    let min = gate.targets.reduce((a, b) => Math.min(a, b));
    let max = gate.targets.reduce((a, b) => Math.max(a, b));
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
    switch (gate.name) {
      case 'hadamard':
        gateIcons.push(
          <Hadamard
            key={`${gate.targets[0]}, ${column}`}
            row={gate.targets[0]}
            column={column}
          ></Hadamard>
        );
        break;
      case 'swap':
        gateIcons.push(
          <Swap
            key={`${gate.targets[0]}, ${column}`}
            row={gate.targets[0]}
            column={column}
          ></Swap>,
          <Swap
            key={`${gate.targets[1]}, ${column}`}
            row={gate.targets[1]}
            column={column}
          ></Swap>
        );
        break;
    }
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
          grid: `repeat(${numRows}, minmax(0, 1fr)) / repeat(${numColumns}, minmax(0, 1fr))`,
        }}
      >
        {gateIcons}
      </div>
    </div>
  );
}
