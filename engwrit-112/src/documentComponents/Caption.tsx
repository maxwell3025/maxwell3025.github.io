import * as React from 'react';

export default function Caption(properties: React.PropsWithChildren<{}>) {
  return (
    <figcaption className="text-center text-xs font-thin text-white/50">
      {properties.children}
    </figcaption>
  );
}
