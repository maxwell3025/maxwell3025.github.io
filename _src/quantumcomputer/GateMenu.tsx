import * as React from 'react';
import Complex from 'complex.js'
import { QuantumGate } from './quantum';

function handleSubmit(
  inputData: string,
  setGateList: (gateList: [number, QuantumGate][]) => void
) {
  let gateList: [number, QuantumGate][] = [];
  inputData.split('\n').forEach(line => {
    let tokens = line.split(' ');
    let newGate: QuantumGate;
    let column = parseInt(tokens[0])
    switch (tokens[1]) {
      case 'H':
        newGate = new QuantumGate(1, 'hadamard');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.coefficients = [
          Complex(Math.SQRT1_2),
          Complex(Math.SQRT1_2),
          Complex(Math.SQRT1_2),
          Complex(-Math.SQRT1_2),
        ];
        gateList.push([column, newGate]);
        break;
      case 'SWAP':
        newGate = new QuantumGate(1, 'swap');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.targets[1] = parseInt(tokens[3]);
        newGate.coefficients = [
          Complex(1),
          Complex(0),
          Complex(0),
          Complex(0),
          Complex(0),
          Complex(0),
          Complex(1),
          Complex(0),
          Complex(0),
          Complex(1),
          Complex(0),
          Complex(0),
          Complex(0),
          Complex(0),
          Complex(0),
          Complex(1),
        ];
        gateList.push([column, newGate]);
        break;
      default:
    }
  });
  setGateList(gateList)
}

export default function GateMenu(properties: {setGateList: (gateList: [number, QuantumGate][]) => void}) {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  return (
    <div>
      <textarea className = "border-2 resize-none bg-inherit border-white"ref={textAreaRef}></textarea>
      <button
        onClick={() => {
          handleSubmit(textAreaRef.current.value, properties.setGateList)
        }}
      >
        Update Circuit
      </button>
    </div>
  );
}
