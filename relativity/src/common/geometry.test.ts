import { expect, test } from 'bun:test';
import { getExponential, intersectCurveMesh, invert, LineMesh, Matrix, Mesh } from './geometry';

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

test("intersectCurveMesh basic true", () => {
    const curve: LineMesh = {
        points: [
            {
                x: 0.25,
                y: 0.25,
                t: -1,
            },
            {
                x: 0.25,
                y: 0.25,
                t: 1,
            },
        ],
        edges: [
            [0, 1],
        ],
    };
    const mesh: Mesh = {
        points: [
            {
                x: 0,
                y: 0,
                t: 0,
            },
            {
                x: 1,
                y: 0,
                t: 0,
            },
            {
                x: 0,
                y: 1,
                t: 0,
            },
        ],
        triangles: [
            [0, 1, 2],
        ],
    };

    expect(intersectCurveMesh(curve, mesh)).toBeTrue();
});

test("intersectCurveMesh basic false", () => {
    const curve: LineMesh = {
        points: [
            {
                x: 1,
                y: 1,
                t: -1,
            },
            {
                x: 1,
                y: 1,
                t: 1,
            },
        ],
        edges: [
            [0, 1],
        ],
    };
    const mesh: Mesh = {
        points: [
            {
                x: 0,
                y: 0,
                t: 0,
            },
            {
                x: 1,
                y: 0,
                t: 0,
            },
            {
                x: 0,
                y: 1,
                t: 0,
            },
        ],
        triangles: [
            [0, 1, 2],
        ],
    };

    expect(intersectCurveMesh(curve, mesh)).toBeFalse();
});

test("intersectCurveMesh basic edge", () => {
    const curve: LineMesh = {
        points: [
            {
                x: 0.5,
                y: 0.5,
                t: -1,
            },
            {
                x: 0.5,
                y: 0.5,
                t: 1,
            },
        ],
        edges: [
            [0, 1],
        ],
    };
    const mesh: Mesh = {
        points: [
            {
                x: 0,
                y: 0,
                t: 0,
            },
            {
                x: 1,
                y: 0,
                t: 0,
            },
            {
                x: 0,
                y: 1,
                t: 0,
            },
        ],
        triangles: [
            [0, 1, 2],
        ],
    };

    expect(intersectCurveMesh(curve, mesh)).toBeTrue();
});
