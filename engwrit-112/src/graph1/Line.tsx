import * as React from 'react';

export default function Line(properties: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  const scale = 1;
  return (
    <line
      x1={properties.x1 / scale}
      y1={properties.y1 / scale}
      x2={properties.x2 / scale}
      y2={properties.y2 / scale}
      transform={`scale(${scale} ${scale})`}
      stroke="#000"
      strokeWidth="1"
      markerEnd="url(#arrowhead)"
    />
  );
}
