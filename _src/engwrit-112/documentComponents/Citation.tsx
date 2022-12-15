import * as React from 'react';
import DocDiv from './DocDiv';

export default function Citation(properties: React.PropsWithChildren<{}>) {
  return (
    <DocDiv>
      <p className="ml-4 -indent-4">{properties.children}</p>
    </DocDiv>
  );
}
