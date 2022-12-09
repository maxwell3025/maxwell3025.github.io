import * as React from 'react';

export default function Paragraph(
  properties: React.PropsWithChildren<{ first?: boolean }>
) {
  if (properties.first) {
    return <p className="indent-0 w-[36rem] mx-auto">{properties.children}</p>;
  } else {
    return <p className="indent-4 w-[36rem] mx-auto">{properties.children}</p>;
  }
}
