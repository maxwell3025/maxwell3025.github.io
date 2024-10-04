import * as React from 'react';
import { QuantumState } from '../Quantum';

export default function StateDisplay(properties: {
  state: QuantumState;
}) {
  let lines = properties.state.toString().split('\n').map((lineString, index) => <span key = {index}>{lineString}<br/></span>)
  return <div className=''>{lines}</div>;
}
