import * as React from 'react';

export default function NodeIcon(
  properties: React.PropsWithChildren<{ row: number; column: number }>
) {
  return (
    <svg
      className="h-full w-full"
      style={{ gridColumn: properties.column + 1, gridRow: properties.row + 1 }}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidyMid meet"
    >
      {properties.children}
    </svg>
  );
}
