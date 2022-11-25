import * as React from 'react';
import { QuantumGate } from './quantum';

export default function CircuitOption(properties: {
  gate: QuantumGate;
  appendGate: (gate: QuantumGate) => void;
}) {
  return <button onClick={event => {properties.appendGate(properties.gate)}}></button>;
}
