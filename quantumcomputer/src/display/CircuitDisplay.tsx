import * as React from 'react';
import { QuantumGate } from '../Quantum';
import Hadamard from '../icons/Hadamard.svg';
import Swap from '../icons/Swap.svg';
import SVGLine from './SVGLine';
import Not from '../icons/Not.svg';
import Dot from '../icons/Dot.svg';
import Phase from '../icons/Phase.svg';

const gateAssets: Map<string, React.FunctionComponent<React.SVGAttributes<SVGElement>>[]> = new Map([
  ['not', [Not]],
  ['cnot', [Dot, Not]],
  ['hadamard', [Hadamard]],
  ['swap', [Swap, Swap]],
  ['phase', [Phase]],
]);

function repositionProbe(
  event: React.MouseEvent<Element, MouseEvent>,
  numRows: number,
  numColumns: number,
  setProbePosition: (probePosition: number) => void
) {
  if(event.buttons === 0) return;
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
  width: number;
  height: number;
}) {
  const numRows = properties.numBits;

  const horizontalWires = [];
  const verticalWires = [];
  const gateIcons = [];
  const cellWidth = properties.width / properties.numColumns;
  const cellHeight = properties.height / properties.numBits;
  const iconScale = Math.min(cellWidth, cellHeight);

  //generate horizontal wires
  for (let row = 0; row < numRows; row++) {
    horizontalWires.push(
      <SVGLine
        key={`${row}`}
        x1={0}
        y1={cellHeight * (row + 0.5)}
        x2={properties.width}
        y2={cellHeight * (row + 0.5)}
      ></SVGLine>
    );
  }

  //add all of the gates
  properties.gateList.forEach(([column, gate]) => {
    let minRow = gate.targets.reduce((a, b) => Math.min(a, b));
    let maxRow = gate.targets.reduce((a, b) => Math.max(a, b));

    if (!gateAssets.has(gate.name)) {
      console.log(`${gate.name} not found in asset list`)
      return;
    }

    //connections btwn wires
    verticalWires.push(
      <SVGLine
        key={`column ${column}, rows ${minRow}-${maxRow}`}
        x1={cellWidth * (column + 0.5)}
        y1={cellHeight * (minRow + 0.5)}
        x2={cellWidth * (column + 0.5)}
        y2={cellHeight * (maxRow + 0.5)}
      ></SVGLine>
    );

    gateAssets.get(gate.name).forEach((Icon, index) => {
      gateIcons.push(
        <Icon
          width={iconScale}
          height={iconScale}
          x={cellWidth * (column + 0.5) - iconScale * 0.5}
          y={cellHeight * (gate.targets[index] + 0.5) - iconScale * 0.5}
        ></Icon>
      );
    });
  });

  //add probe
  const probeMarker = (
    <SVGLine
      x1={cellWidth * properties.probePosition}
      y1={0}
      x2={cellWidth * properties.probePosition}
      y2={properties.height}
    ></SVGLine>
  );

  //render
  return (
    <svg
      viewBox={`0 0 ${properties.width} ${properties.height}`}
      style={{
        width: properties.width,
        height: properties.height
      }}
      preserveAspectRatio="none"
      onMouseMove={evt => repositionProbe(evt, properties.numBits, properties.numColumns, properties.setProbePosition)}
    >
      {horizontalWires}
      {verticalWires}
      {probeMarker}
      {gateIcons}
    </svg>
  );
}
