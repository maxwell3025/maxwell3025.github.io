import * as React from 'react';

export default function SVGLine(properties: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  return (
    <line
      className="stroke-white"
      strokeWidth="1px"
      vectorEffect="non-scaling-stroke"
      x1={properties.x1 * 100}
      y1={properties.y1 * 100}
      x2={properties.x2 * 100}
      y2={properties.y2 * 100}
    ></line>
  );
}
