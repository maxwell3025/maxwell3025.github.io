import * as React from 'react';
import { QuantumGate } from './quantum';
import Hadamard from './icons/Hadamard';
import Swap from './icons/Swap';
import SVGLine from './SVGLine';

function handleClick(
  event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  numRows: number,
  numColumns: number,
  setProbePosition: (probePosition: number) => void
) {
  let boundingRect = event.currentTarget.getBoundingClientRect();
  let x = ((event.pageX - boundingRect.x) / boundingRect.width) * numColumns;
  let y = ((event.pageY - boundingRect.y) / boundingRect.height) * numRows;
  setProbePosition(Math.round(x));
}

export default function CircuitDisplay(properties: {
  numBits: number;
  numColumns: number;
  gateList: [number, QuantumGate][];
  probePosition: number;
  setProbePosition: (probePosition: number) => void;
}) {
  const numRows = properties.numBits;

  let horizontalWires = [];
  let verticalWires = [];
  let gateIcons = [];
  let probeMarker;

  //generate horizontal wires
  for (let row = 0; row < numRows; row++) {
    horizontalWires.push(
      <SVGLine
        key={`${row}`}
        x1={0}
        y1={row + 0.5}
        x2={properties.numColumns}
        y2={row + 0.5}
      ></SVGLine>
    );
  }

  //add all of the gates
  properties.gateList.forEach(([column, gate]) => {
    let min = gate.targets.reduce((a, b) => Math.min(a, b));
    let max = gate.targets.reduce((a, b) => Math.max(a, b));
    //connections btwn wires
    verticalWires.push(
      <SVGLine
        key={`column ${column}, rows ${min}-${max}`}
        x1={column + 0.5}
        y1={min + 0.5}
        x2={column + 0.5}
        y2={max + 0.5}
      ></SVGLine>
    );
    //gate icons
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

  //add probe
  probeMarker = (
    <SVGLine
      x1={properties.probePosition}
      y1={0}
      x2={properties.probePosition}
      y2={numRows}
    ></SVGLine>
  );

  //render
  return (
    <div className="relative flex-grow">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${properties.numColumns * 100} ${numRows * 100}`}
        preserveAspectRatio="none"
      >
        {horizontalWires}
        {verticalWires}
        {probeMarker}
      </svg>
      <div
        className="col absolute inset-0 grid h-full w-full"
        style={{
          grid: `repeat(${numRows}, minmax(0, 1fr)) / repeat(${properties.numColumns}, minmax(0, 1fr))`,
        }}
        onClick={evt => {
          handleClick(evt, numRows, properties.numColumns, properties.setProbePosition);
        }}
      >
        {gateIcons}
      </div>
    </div>
  );
}
