import * as React from 'react';

export default function Dropdown(
  properties: React.PropsWithChildren<{ title: string }>
) {
  const [open, setOpen] = React.useState(false);
  if (open) {
    return (
      <div className="flex flex-col">
        <div onClick={() => setOpen(false)}>{properties.title}</div>
        <div className="h-max overflow-clip transition-all duration-500 ease-in-out">
          {properties.children}
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col">
        <div onClick={() => setOpen(true)}>{properties.title}</div>
        <div className="h-0 overflow-clip transition-all duration-500 ease-in-out">
          {properties.children}
        </div>
      </div>
    );
  }
}
