import * as React from 'react';
import Complex from 'complex.js'
import { QuantumGate } from './quantum';

function handleSubmit(
  inputData: string,
  setGateList: (gateList: QuantumGate[]) => void
) {
  let gateList: QuantumGate[] = [];
  inputData.split('\n').forEach(line => {
    let tokens = line.split(' ');
    let newGate: QuantumGate;
    switch (tokens[0]) {
      case 'H':
        newGate = new QuantumGate(1, 'hadamard');
        newGate.targets[0] = parseInt(tokens[1]);
        newGate.coefficients = [
          Complex(Math.SQRT1_2),
          Complex(Math.SQRT1_2),
          Complex(Math.SQRT1_2),
          Complex(-Math.SQRT1_2),
        ];
        gateList.push(newGate);
        break;
      case 'SWAP':
        newGate = new QuantumGate(1, 'swap');
        newGate.targets[0] = parseInt(tokens[1]);
        newGate.targets[1] = parseInt(tokens[2]);
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
        gateList.push(newGate);
        break;
      default:
    }
  });
  setGateList(gateList)
}

export default function GateMenu(properties: {setGateList: (gateList: QuantumGate[]) => void}) {
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
