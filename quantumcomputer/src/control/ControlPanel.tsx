import * as React from 'react';
import { QuantumGate } from '../Quantum';
import coefficients from '../Coefficients';

function parseScript(code: string): [number, QuantumGate][] {
  let gateList: [number, QuantumGate][] = [];
  code.split('\n').forEach(line => {
    let tokens = line.split(' ');
    let newGate: QuantumGate;
    let column = parseInt(tokens[0]);
    switch (tokens[1]) {
      case 'H':
        newGate = new QuantumGate(1, 'hadamard');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.coefficients = coefficients.H;
        gateList.push([column, newGate]);
        break;
      case 'SWAP':
        newGate = new QuantumGate(2, 'swap');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.targets[1] = parseInt(tokens[3]);
        newGate.coefficients = coefficients.SWAP;
        gateList.push([column, newGate]);
        break;
      case 'NOT':
        newGate = new QuantumGate(1, 'not');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.coefficients = coefficients.NOT;
        gateList.push([column, newGate]);
        break;
      case 'CNOT':
        newGate = new QuantumGate(2, 'cnot');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.targets[1] = parseInt(tokens[3]);
        newGate.coefficients = coefficients.CNOT;
        gateList.push([column, newGate]);
        break;
      default:
        console.log('Malformed Input');
    }
  });
  return gateList;
}

export default function ControlPanel(properties: {
  setGateList: (gateList: [number, QuantumGate][]) => void;
  columnCount: number;
  bitCount: number;
  setColumnCount: (number) => void;
  setBitCount: (number) => void;
}) {
  const scriptInput = React.useRef<HTMLTextAreaElement>(null);
  const bitWidthSlider = React.useRef<HTMLInputElement>(null);
  const columnCountSlider = React.useRef<HTMLInputElement>(null);
  const update = () => {
    properties.setGateList(parseScript(scriptInput.current.value));
    properties.setBitCount(parseInt(bitWidthSlider.current.value));
    properties.setColumnCount(parseInt(columnCountSlider.current.value));
  };
  return (
    <div>
      <textarea
        className="resize-none border-2 border-white bg-inherit"
        ref={scriptInput}
        onInput={update}
      ></textarea>
      <input
        type="range"
        min="1"
        max="16"
        defaultValue={properties.bitCount}
        ref={bitWidthSlider}
        onChange={update}
      ></input>
      <label>bit count: {properties.bitCount}</label>
      <input
        type="range"
        min="1"
        max="100"
        defaultValue={properties.columnCount}
        ref={columnCountSlider}
        onChange={update}
      ></input>
      <label>column count: {properties.columnCount}</label>
    </div>
  );
}
