import * as React from 'react';
import NodeIcon from './NodeIcon';

export default function Hadamard() {
  return (
    <NodeIcon>
      <rect
        x={25}
        y={25}
        width={50}
        height={50}
        vectorEffect="non-scaling-stroke"
        className="fill-black stroke-white"
        strokeWidth="1px"
      ></rect>
      <line
        className="stroke-white"
        strokeWidth="1px"
        vectorEffect="non-scaling-stroke"
        x1={25 + 50 / 3}
        y1={25 + 25 / 2}
        x2={25 + 50 / 3}
        y2={25 + 25 / 2 + 25}
      ></line>
      <line
        className="stroke-white"
        strokeWidth="1px"
        vectorEffect="non-scaling-stroke"
        x1={25 + 100 / 3}
        y1={25 + 25 / 2}
        x2={25 + 100 / 3}
        y2={25 + 25 / 2 + 25}
      ></line>
      <line
        className="stroke-white"
        strokeWidth="1px"
        vectorEffect="non-scaling-stroke"
        x1={25 + 50 / 3}
        y1={50}
        x2={25 + 100 / 3}
        y2={50}
      ></line>
    </NodeIcon>
  );
}
