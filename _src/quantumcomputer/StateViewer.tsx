import * as React from 'react';
import { QuantumState } from './quantum';

export default function StateViewer(properties: {
  stateRef: React.MutableRefObject<(x: QuantumState)=>void>;
}) {
  const [quantumState, setQuantumState] = React.useState<QuantumState>(new QuantumState(1))
  properties.stateRef.current = setQuantumState;
  let lines = quantumState.toString().split('\n').map((lineString, index) => <span key = {index}>{lineString}<br/></span>)
  return <div className=''>{lines}</div>;
}
