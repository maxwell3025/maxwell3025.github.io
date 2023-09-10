import * as React from 'react';

export default function CountryDescription(
  properties: React.PropsWithChildren<{
    selectedCountry: string;
    setSelectedCountry: (selectedCountry: string) => void;
    id: string;
  }>
) {
  const id = properties.id;
  if (id == properties.selectedCountry) {
    return (
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => properties.setSelectedCountry(null)}
      >
        <div className="m-auto h-96 w-96">{properties.children}</div>
      </div>
    );
  } else {
    return <></>;
  }
}
