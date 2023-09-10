import * as React from 'react';

export default function Sticky(properties: React.PropsWithChildren<{}>) {
  const divRef = React.useRef();
  React.useEffect(() => {
    const scrollListener = function (event: Event) {};
    let event = window.addEventListener('scroll', scrollListener);
    return () => window.removeEventListener('scroll', scrollListener);
  }, []);
  return <div>{properties.children}</div>;
}
