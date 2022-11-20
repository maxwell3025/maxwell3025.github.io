import * as React from 'react';
import { QuantumState } from './quantum';

export function StateViewer(properties: {
  stateRef: React.MutableRefObject<(x: QuantumState)=>void>;
}) {
  const [quantumState, setQuantumState] = React.useState<QuantumState>(new QuantumState(1))
  properties.stateRef.current = setQuantumState;
  return <div>{`${quantumState}`}</div>;
}
