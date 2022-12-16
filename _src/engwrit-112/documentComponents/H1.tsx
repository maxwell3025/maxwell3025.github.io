import * as React from 'react';

export default function H1(properties: React.PropsWithChildren<{}>) {
  return (
    <h1 className="my-5 text-center text-4xl font-semibold">
      {properties.children}
    </h1>
  );
}
