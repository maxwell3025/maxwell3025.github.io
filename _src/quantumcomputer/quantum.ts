import { complex } from 'ts-complex-numbers';

export class ClassicalState {
  bits: boolean[];
  bitCount: number;
  constructor(bitCount: number, value = 0) {
    this.bitCount = bitCount;
    this.bits = [];
    let bitMask = 1;
    for (let bitIndex = 0; bitIndex < bitCount; bitIndex++) {
      this.bits.push((bitMask & value) > 0);
      bitMask = bitMask << 1;
    }
  }
  get value(): number {
    let value = 0;
    for (let i = 0; i < this.bitCount; i++) {
      if (this.bits[i]) value += Math.pow(2, i);
    }
    return value;
  }
  clone(): ClassicalState {
    return new ClassicalState(this.bitCount, this.value);
  }
  toString(): string {
    let output = '|';
    this.bits.map(a=>a).reverse().forEach(bit => {
      output += bit ? '1' : '0';
    });
    output += '>';
    return output;
  }
}

function ennumerateStates(bitCount: number): ClassicalState[] {
  let valueCount = Math.pow(2, bitCount);
  let output: ClassicalState[] = [];
  for (let value = 0; value < valueCount; value++) {
    output.push(new ClassicalState(bitCount, value));
  }
  return output;
}
export class QuantumState {
  amplitudes: complex[];
  bitCount: number;
  constructor(bitCount: number, value = 0) {
    let stateCount = Math.pow(2, bitCount);
    this.bitCount = bitCount;
    this.amplitudes = [];
    for (let i = 0; i < value; i++) {
      this.amplitudes.push(new complex(0, 0));
    }
    this.amplitudes.push(new complex(1, 0));
    for (let i = 0; i < stateCount - value - 1; i++) {
      this.amplitudes.push(new complex(0, 0));
    }
  }
  //TODO
  swap(bitA, bitB = bitA + 1): QuantumState {
    let output = new QuantumState(this.bitCount);
    ennumerateStates(this.bitCount).forEach(outputClassicalState => {
      let inputClassicalState = outputClassicalState.clone();
      //swap indices in input
      let temp = inputClassicalState.bits[bitA];
      inputClassicalState.bits[bitA] = inputClassicalState.bits[bitB];
      inputClassicalState.bits[bitB] = temp;
      output.amplitudes[outputClassicalState.value] =
        this.amplitudes[inputClassicalState.value];
      //TODO
    });
    return output;
  }
  toString(): string {
    let output = '';
    ennumerateStates(this.bitCount).forEach(classicalState => {
      output += `${classicalState}: ${this.amplitudes[classicalState.value]}\n`;
    });
    return output;
  }
}
