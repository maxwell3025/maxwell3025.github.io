import Complex from 'complex.js';

export default {
  H: [
    new Complex(Math.SQRT1_2),
    new Complex(Math.SQRT1_2),
    new Complex(Math.SQRT1_2),
    new Complex(-Math.SQRT1_2),
  ],
  SWAP: [
    new Complex(1),
    new Complex(0),
    new Complex(0),
    new Complex(0),
    new Complex(0),
    new Complex(0),
    new Complex(1),
    new Complex(0),
    new Complex(0),
    new Complex(1),
    new Complex(0),
    new Complex(0),
    new Complex(0),
    new Complex(0),
    new Complex(0),
    new Complex(1),
  ],
  NOT: [new Complex(0), new Complex(1), new Complex(1), new Complex(0)],
  CNOT: [
    new Complex(1),
    new Complex(0),
    new Complex(0),
    new Complex(0),

    new Complex(0),
    new Complex(1),
    new Complex(0),
    new Complex(0),

    new Complex(0),
    new Complex(0),
    new Complex(0),
    new Complex(1),

    new Complex(0),
    new Complex(0),
    new Complex(1),
    new Complex(0),
  ],
};
