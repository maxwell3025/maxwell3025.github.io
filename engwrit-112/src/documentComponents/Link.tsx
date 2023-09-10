import * as React from 'react';

export default function Link(
  properties: React.PropsWithChildren<{ href: string }>
) {
  return (
    <a href={properties.href} className="font-semibold text-red-200">
      {properties.children}
    </a>
  );
}
