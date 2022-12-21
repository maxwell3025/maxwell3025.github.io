import * as React from 'react';
import NodeIcon from './NodeIcon';

export default function Phase() {
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
        x1={25 + 50 / 3}
        y1={25 + 25 / 2}
        x2={50}
        y2={25 + 25 / 2}
      ></line>
      <line
        className="stroke-white"
        strokeWidth="1px"
        vectorEffect="non-scaling-stroke"
        x1={25 + 50 / 3}
        y1={50}
        x2={50}
        y2={50}
      ></line>
      <path
        className="stroke-white"
        strokeWidth="1px"
        vectorEffect="non-scaling-stroke"
        d="M 50 37.5 A 6.25 6.25 0 0 1 50 50"
      ></path>
    </NodeIcon>
  );
}
