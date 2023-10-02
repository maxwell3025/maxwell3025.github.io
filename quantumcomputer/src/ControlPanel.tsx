import * as React from 'react';
import Complex from 'complex.js';
import { QuantumGate } from './quantum';
import getCoefficients from './Coefficients';
import { Slider } from '@mui/material';

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
        newGate.coefficients = getCoefficients('H');
        gateList.push([column, newGate]);
        break;
      case 'SWAP':
        newGate = new QuantumGate(2, 'swap');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.targets[1] = parseInt(tokens[3]);
        newGate.coefficients = getCoefficients('SWAP');
        gateList.push([column, newGate]);
        break;
      case 'NOT':
        newGate = new QuantumGate(1, 'not');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.coefficients = getCoefficients('NOT');
        gateList.push([column, newGate]);
        break;
      case 'CNOT':
        newGate = new QuantumGate(2, 'cnot');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.targets[1] = parseInt(tokens[3]);
        newGate.coefficients = getCoefficients('CNOT');
        gateList.push([column, newGate]);
        break;
      case 'PHASE':
        newGate = new QuantumGate(1, 'phase');
        newGate.targets[0] = parseInt(tokens[2]);
        newGate.coefficients = getCoefficients('PHASE', parseFloat(tokens[3]));
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
  return (
    <div>
      <textarea
        className="resize-none border-2 border-white bg-inherit"
        ref={scriptInput}
      ></textarea>
      <input
        type="range"
        min="1"
        max="16"
        defaultValue={properties.bitCount}
        ref={bitWidthSlider}
      ></input>
      <input
        type="range"
        min="1"
        max="100"
        defaultValue={properties.columnCount}
        ref={columnCountSlider}
      ></input>
      <button
        onClick={() => {
          properties.setGateList(parseScript(scriptInput.current.value));
          properties.setBitCount(parseInt(bitWidthSlider.current.value));
          properties.setColumnCount(parseInt(columnCountSlider.current.value));
        }}
      >
        Update Circuit
      </button>
    </div>
  );
}
