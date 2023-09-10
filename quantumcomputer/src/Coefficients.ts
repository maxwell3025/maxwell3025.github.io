import Complex from 'complex.js';

export default function getCoefficients(id: string, ...args: number[]) {
  switch (id) {
    case 'H':
      return [
        new Complex(Math.SQRT1_2),
        new Complex(Math.SQRT1_2),
        new Complex(Math.SQRT1_2),
        new Complex(-Math.SQRT1_2),
      ];
    case 'SWAP':
      return [
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
      ];
    case 'NOT':
      return [new Complex(0), new Complex(1), new Complex(1), new Complex(0)];
    case 'CNOT':
      return [
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
      ];
    case 'PHASE':
      return [
        new Complex(1),
        new Complex(0),
        new Complex(0),
        new Complex(Math.cos(Math.PI * args[0]), Math.sin(Math.PI * args[0])),
      ]

  }
}
