import * as React from 'react';
import { QuantumState } from './quantum';

export default function StateViewer(properties: {
  state: QuantumState;
}) {
  let lines = properties.state.toString().split('\n').map((lineString, index) => <span key = {index}>{lineString}<br/></span>)
  return <div className=''>{lines}</div>;
}
