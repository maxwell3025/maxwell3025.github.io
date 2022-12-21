import * as React from 'react';
import Complex from 'complex.js'
import { QuantumGate } from './quantum';
import getCoefficients from './Coefficients';

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
        newGate.coefficients = getCoefficients('H')
        gateList.push([column, newGate]);
        break;
      case 'SWAP':
        newGate = new QuantumGate(2, 'swap');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.targets[1] = parseInt(tokens[3]);
        newGate.coefficients = getCoefficients('SWAP')
        gateList.push([column, newGate]);
        break;
      case 'NOT':
        newGate = new QuantumGate(1, 'not');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.coefficients = getCoefficients('NOT')
        gateList.push([column, newGate]);
        break;
      case 'CNOT':
        newGate = new QuantumGate(2, 'cnot');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.targets[1] = parseInt(tokens[3]);
        newGate.coefficients = getCoefficients('CNOT')
        gateList.push([column, newGate]);
        break;
      case 'PHASE':
        newGate = new QuantumGate(1, 'phase');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.coefficients = getCoefficients('PHASE', parseFloat(tokens[3]))
        gateList.push([column, newGate]);
        break;
      default:
        console.log("Malformed Input")
    }
  });
  setGateList(gateList)
}

export default function ControlPanel(properties: {setGateList: (gateList: [number, QuantumGate][]) => void}) {
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
