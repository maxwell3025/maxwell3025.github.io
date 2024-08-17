import { expect, test } from 'bun:test';
import { getExponential, invert, Matrix } from './geometry';

function expectMatricesToBeClose(lhs: Matrix, rhs: Matrix) {
    for(let i = 0; i < 16; i++){
        expect(lhs[i]).toBeCloseTo(rhs[i]);
    }
}

test("invert basic", () => {
    const inverse = invert([
        1, 2, 3, 0,
        4, 5, 6, 0,
        7, 8, 10, 0,
        0, 0, 0, 1,
    ]);

    expectMatricesToBeClose(inverse, [
        -2/3, -4/3, 1, 0,
        -2/3, 11/3, -2, 0,
        1, -2, 1, 0,
        0, 0, 0, 1,
    ]);
});

test("getGenerator basic", () => {
    const generator = getExponential([
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
    ]);

    const output = generator(Math.PI / 2);

    expectMatricesToBeClose(output, [
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
});

test("getGenerator large values", () => {
    const generator = getExponential([
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
    ]);

    const output = generator(Math.PI * 100 + Math.PI / 2);

    expectMatricesToBeClose(output, [
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
});

test("getGenerator large negatives", () => {
    const generator = getExponential([
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
    ]);

    const output = generator(Math.PI * -100 + Math.PI / 2);

    expectMatricesToBeClose(output, [
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
});
