import { expect, test } from 'bun:test';
import { getGenerator, invert } from './geometry';
test("invert basic", () => {
    const inverse = invert([
        1, 2, 3,
        4, 5, 6,
        7, 8, 10,
    ]);
    expect(inverse[0]).toBeCloseTo(-2/3);
    expect(inverse[1]).toBeCloseTo(-4/3);
    expect(inverse[2]).toBeCloseTo(1);
    expect(inverse[3]).toBeCloseTo(-2/3);
    expect(inverse[4]).toBeCloseTo(11/3);
    expect(inverse[5]).toBeCloseTo(-2);
    expect(inverse[6]).toBeCloseTo(1);
    expect(inverse[7]).toBeCloseTo(-2);
    expect(inverse[8]).toBeCloseTo(1);
});

test("getGenerator basic", () => {
    const generator = getGenerator([
        0, 1, 0,
        -1, 0, 0,
        0, 0, 0,
    ]);

    const output = generator(Math.PI / 2);
    expect(output[0]).toBeCloseTo(0);
    expect(output[1]).toBeCloseTo(1);
    expect(output[2]).toBeCloseTo(0);
    expect(output[3]).toBeCloseTo(-1);
    expect(output[4]).toBeCloseTo(0);
    expect(output[5]).toBeCloseTo(0);
    expect(output[6]).toBeCloseTo(0);
    expect(output[7]).toBeCloseTo(0);
    expect(output[8]).toBeCloseTo(1);
});

test("getGenerator large values", () => {
    const generator = getGenerator([
        0, 1, 0,
        -1, 0, 0,
        0, 0, 0,
    ]);

    const output = generator(Math.PI * 100 + Math.PI / 2);
    expect(output[0]).toBeCloseTo(0);
    expect(output[1]).toBeCloseTo(1);
    expect(output[2]).toBeCloseTo(0);
    expect(output[3]).toBeCloseTo(-1);
    expect(output[4]).toBeCloseTo(0);
    expect(output[5]).toBeCloseTo(0);
    expect(output[6]).toBeCloseTo(0);
    expect(output[7]).toBeCloseTo(0);
    expect(output[8]).toBeCloseTo(1);
});

test("getGenerator large negatives", () => {
    const generator = getGenerator([
        0, 1, 0,
        -1, 0, 0,
        0, 0, 0,
    ]);

    const output = generator(Math.PI * -100 + Math.PI / 2);
    expect(output[0]).toBeCloseTo(0);
    expect(output[1]).toBeCloseTo(1);
    expect(output[2]).toBeCloseTo(0);
    expect(output[3]).toBeCloseTo(-1);
    expect(output[4]).toBeCloseTo(0);
    expect(output[5]).toBeCloseTo(0);
    expect(output[6]).toBeCloseTo(0);
    expect(output[7]).toBeCloseTo(0);
    expect(output[8]).toBeCloseTo(1);
});
