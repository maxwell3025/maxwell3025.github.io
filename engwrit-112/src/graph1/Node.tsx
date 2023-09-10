import * as React from 'react';

export default function Node(
  properties: React.PropsWithChildren<{
    x: number;
    y: number;
    setActiveNode: (x: string) => void;
    activeNode: string;
    title: string;
  }>
) {
  //hyperparameters
  const circleRadius = 5;
  const explanationWidth = 384;
  const explanationHeight = 384;
  const textScale = 0.1;

  const id = React.useId();
  let offsetX = 0;
  if (properties.x > 70) {
    offsetX = -explanationWidth;
  }
  let offsetY = -explanationHeight * 0.5;
  if (properties.y < 20) {
    offsetY = 0;
  }
  let defaultRender = (
    <>
      <circle
        cx={properties.x}
        cy={properties.y}
        r={circleRadius}
        onClick={() => properties.setActiveNode(id)}
        className="fill-white"
      ></circle>
      <text
        x={0}
        y={0}
        transform={`translate(${properties.x} ${properties.y}) scale(0.1 0.1)`}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {properties.title}
      </text>
    </>
  );
  if (properties.activeNode == id) {
    return (
      <>
        {defaultRender}
        <foreignObject
          x={offsetX}
          y={offsetY}
          transform={`translate(${properties.x} ${properties.y}) scale(${textScale} ${textScale})`}
          textAnchor="middle"
          width={explanationWidth}
          height={explanationHeight}
        >
          <div className="h-96 w-96 bg-black/25">{properties.children}</div>
        </foreignObject>
        <rect
          x={0}
          y={0}
          width={100}
          height={100}
          onClick={() => properties.setActiveNode(null)}
          className="fill-black/0"
        ></rect>
      </>
    );
  } else {
    return defaultRender;
  }
}
