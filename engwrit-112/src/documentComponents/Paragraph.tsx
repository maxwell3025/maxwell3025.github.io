import * as React from 'react';
import DocDiv from './DocDiv';

export default function Paragraph(
  properties: React.PropsWithChildren<{ first?: boolean }>
) {
  if (properties.first) {
    return (
      <DocDiv>
        <p className="indent-0">{properties.children}</p>
      </DocDiv>
    );
  } else {
    return (
      <DocDiv>
        <p className="indent-4">{properties.children}</p>
      </DocDiv>
    );
  }
}
