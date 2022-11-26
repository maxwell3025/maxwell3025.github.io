import * as React from 'react';
import NodeIcon from './NodeIcon';

export default function Swap(properties: { row: number; column: number }) {
  return (
    <NodeIcon row = {properties.row} column = {properties.column}>
      <line
        className="stroke-white"
        strokeWidth="1px"
        vectorEffect="non-scaling-stroke"
        x1="25"
        y1="25"
        x2="75"
        y2="75"
      ></line>
      <line
        className="stroke-white"
        strokeWidth="1px"
        vectorEffect="non-scaling-stroke"
        x1="25"
        y1="75"
        x2="75"
        y2="25"
      ></line>
    </NodeIcon>
  );
}
