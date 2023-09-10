import * as React from 'react';

export default function DocDiv(properties: React.PropsWithChildren<{}>) {
  return <div className="mx-auto w-[36rem]">{properties.children}</div>;
}
