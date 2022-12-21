import * as React from 'react';
import NodeIcon from './NodeIcon';

export default function Not(){
  return (
    <NodeIcon>
      <circle
        cx={50}
        cy={50}
        r={25}
        vectorEffect="non-scaling-stroke"
        className="fill-black stroke-white"
        strokeWidth="1px"
      ></circle>
      <line
        className="stroke-white"
        strokeWidth="1px"
        vectorEffect="non-scaling-stroke"
        x1={25}
        y1={50}
        x2={75}
        y2={50}
      ></line>
      <line
        className="stroke-white"
        strokeWidth="1px"
        vectorEffect="non-scaling-stroke"
        x1={50}
        y1={25}
        x2={50}
        y2={75}
      ></line>
    </NodeIcon>
  );
}
