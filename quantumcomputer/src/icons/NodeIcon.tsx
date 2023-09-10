import * as React from 'react';

export default function NodeIcon(properties: React.PropsWithChildren<{}>) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {properties.children}
    </svg>
  );
}
