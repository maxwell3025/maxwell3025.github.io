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
    this.bits
      .map(a => a)
      .reverse()
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
  coefficients: complex[];
  bitCount: number;
  targets: number[];
  constructor(bitCount: number) {
    this.bitCount = bitCount;
    let matrixWidth = Math.pow(2, bitCount);
    this.targets = [];
    for (let i = 0; i < bitCount; i++) {
      this.targets.push(i);
    }
    this.coefficients = [];
    for (let i = 0; i < matrixWidth * matrixWidth; i++) {
      this.coefficients.push(new complex(0, 0));
    }
    for (let i = 0; i < matrixWidth; i++) {
      this.coefficients[i + i * matrixWidth] = new complex(1, 0);
    }
  }
}
export class QuantumState {
  amplitudes: complex[];
  bitCount: number;
  name: string | null;
  constructor(bitCount: number, value = 0, name: string | null = null) {
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
    });
    return output;
  }
  genericGate(bits: number[], coefficients: complex[]): QuantumState {
    let output = new QuantumState(this.bitCount);
    let matrixSize = Math.pow(2, bits.length);
    ennumerateStates(this.bitCount).forEach(outputClassicalState => {
      let outputSubState = new ClassicalState(bits.length);
      outputSubState.bits = bits.map(index => outputClassicalState.bits[index]);
      let outputAmplitude = new complex(0, 0);
      ennumerateStates(bits.length).forEach(inputSubState => {
        let inputClassicalState = outputClassicalState.clone();
        bits.forEach((value, index) => {
          inputClassicalState.bits[value] = inputSubState.bits[index];
        });
        outputAmplitude = outputAmplitude.add(
          coefficients[
            outputSubState.value * matrixSize + inputSubState.value
          ].mult(this.amplitudes[inputClassicalState.value])
        );
      });
      output.amplitudes[outputClassicalState.value] = outputAmplitude;
    });
    return output;
  }
  cnot(bitA, bitB = bitA + 1): QuantumState {
    let output = new QuantumState(this.bitCount);
    ennumerateStates(this.bitCount).forEach(outputClassicalState => {
      let inputState = outputClassicalState.clone();
      if (inputState.bits[bitA]) inputState.bits[bitB] = !inputState.bits[bitB];
      output.amplitudes[outputClassicalState.value] =
        this.amplitudes[inputState.value];
    });
    return output;
  }
  deutsch(
    bitA,
    bitB = bitA + 1,
    bitC = bitA + 2,
    theta = Math.PI / 2
  ): QuantumState {
    let output = new QuantumState(this.bitCount);
    ennumerateStates(this.bitCount).forEach(outputClassicalState => {
      let a = outputClassicalState.bits[bitA];
      let b = outputClassicalState.bits[bitB];
      let c = outputClassicalState.bits[bitC];
      if (a == true && b == true) {
        let stateAB_C = outputClassicalState.clone();
        stateAB_C.bits[bitC] = !stateAB_C.bits[bitC];
        let amplitudeABC = this.amplitudes[outputClassicalState.value];
        let amplitudeAB_C = this.amplitudes[stateAB_C.value];
        let outputAmplitude = amplitudeABC
          .mult(new complex(0, Math.cos(theta)))
          .add(amplitudeAB_C.scalarMult(Math.sin(theta)));
        output.amplitudes[outputClassicalState.value] = outputAmplitude;
      } else {
        output.amplitudes[outputClassicalState.value] =
          this.amplitudes[outputClassicalState.value];
      }
    });
    return output;
  }
  hadamard(bit): QuantumState {
    let output = new QuantumState(this.bitCount);
    ennumerateStates(this.bitCount).forEach(outputClassicalState => {
      let inputBit = outputClassicalState.bits[bit];
      let inputState0 = outputClassicalState.clone();
      let inputState1 = outputClassicalState.clone();
      inputState0.bits[bit] = false;
      inputState1.bits[bit] = true;
      let outputAmplitude = new complex(0, 0);
      if (inputBit) {
        outputAmplitude = outputAmplitude.add(
          this.amplitudes[inputState0.value]
        );
        outputAmplitude = outputAmplitude.sub(
          this.amplitudes[inputState1.value]
        );
      } else {
        outputAmplitude = outputAmplitude.add(
          this.amplitudes[inputState0.value]
        );
        outputAmplitude = outputAmplitude.add(
          this.amplitudes[inputState1.value]
        );
      }
      outputAmplitude = outputAmplitude.scalarMult(Math.SQRT1_2);
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
      let amplitudes = this.amplitudes[classicalState.value];
      output += `${classicalState}: ${formatNumber(
        amplitudes.real
      )}\t ${formatNumber(amplitudes.img)}i\n`;
    });
    return output;
  }
}
