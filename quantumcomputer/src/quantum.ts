import Complex from 'complex.js';

export class ClassicalState {
  bits: boolean[];
  bitCount: number;
  constructor(bitCount: number, value = 0) {
    this.bitCount = bitCount;
    this.bits = [];
    let bitMask = Math.pow(2, bitCount) >> 1;
    for (let bitIndex = 0; bitIndex < bitCount; bitIndex++) {
      this.bits.push((bitMask & value) > 0);
      bitMask = bitMask >> 1;
    }
  }
  get value(): number {
    let value = 0;
    let bitMask = Math.pow(2, this.bitCount) >> 1;
    for (let i = 0; i < this.bitCount; i++) {
      if (this.bits[i]) {
        value += bitMask;
      }
      bitMask = bitMask >> 1;
    }
    return value;
  }
  clone(): ClassicalState {
    return new ClassicalState(this.bitCount, this.value);
  }
  toString(): string {
    let output = '|';
    this.bits
      .map(a => a)
      .forEach(bit => {
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

export class QuantumGate {
  coefficients: Complex[];
  bitCount: number;
  targets: number[];
  name: string | null;
  constructor(bitCount: number, name: string | null = null) {
    this.name = name;
    this.bitCount = bitCount;
    let matrixWidth = Math.pow(2, bitCount);
    this.targets = [];
    for (let i = 0; i < bitCount; i++) {
      this.targets.push(i);
    }
    this.coefficients = [];
    for (let i = 0; i < matrixWidth * matrixWidth; i++) {
      this.coefficients.push(new Complex(0, 0));
    }
    for (let i = 0; i < matrixWidth; i++) {
      this.coefficients[i + i * matrixWidth] = new Complex(1, 0);
    }
  }
}
export class QuantumState {
  amplitudes: Complex[];
  bitCount: number;
  constructor(bitCount: number, value = 0) {
    let stateCount = Math.pow(2, bitCount);
    this.bitCount = bitCount;
    this.amplitudes = [];
    for (let i = 0; i < value; i++) {
      this.amplitudes.push(new Complex(0, 0));
    }
    this.amplitudes.push(new Complex(1, 0));
    for (let i = 0; i < stateCount - value - 1; i++) {
      this.amplitudes.push(new Complex(0, 0));
    }
  }
  genericGate(bits: number[], coefficients: Complex[]): QuantumState {
    let output = new QuantumState(this.bitCount);
    const matrixSize = Math.pow(2, bits.length);
    ennumerateStates(this.bitCount).forEach(outputClassicalState => {
      const outputSubState = new ClassicalState(bits.length);
      outputSubState.bits = bits.map(index => outputClassicalState.bits[index]);
      let outputAmplitude = new Complex(0, 0);
      ennumerateStates(bits.length).forEach(inputSubState => {
        let inputClassicalState = outputClassicalState.clone();
        bits.forEach((value, index) => {
          inputClassicalState.bits[value] = inputSubState.bits[index];
        });
        console.log(
          `${inputClassicalState.value} -> ${outputClassicalState.value}: ${
            coefficients[
              outputSubState.value * matrixSize + inputSubState.value
            ]
          }`
        );
        outputAmplitude = outputAmplitude.add(
          coefficients[
            outputSubState.value * matrixSize + inputSubState.value
          ].mul(this.amplitudes[inputClassicalState.value])
        );
      });
      output.amplitudes[outputClassicalState.value] = outputAmplitude;
    });
    return output;
  }
  toString(): string {
    let output = '';
    const formatNumber = (n: number) => {
      return (
        (n < 0 ? '' : '+') +
        n.toLocaleString(undefined, {
          minimumFractionDigits: 4,
          maximumFractionDigits: 4,
        })
      );
    };
    ennumerateStates(this.bitCount).forEach(classicalState => {
      let amplitude = this.amplitudes[classicalState.value];
      output += `${classicalState}: ${formatNumber(
        amplitude.re
      )}\t ${formatNumber(amplitude.im)}i\n`;
    });
    return output;
  }
  clone(): QuantumState {
    let output: QuantumState = new QuantumState(this.bitCount);
    output.amplitudes = this.amplitudes.map(a => a.clone());
    return output;
  }
}
