import * as React from 'react';

export default function H2(properties: React.PropsWithChildren<{}>) {
  return <h2 className="my-2 text-center text-2xl font-normal">
    {properties.children}
  </h2>;
}