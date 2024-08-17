export type Vector = {
    t: number
    x: number
    y: number
};

export type Matrix = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

function isCoord(value: Vector | Matrix | number): value is Vector{
    return !Array.isArray(value) && typeof value ==='object';
}

function isMatrix(value: Vector | Matrix | number): value is Matrix{
    return Array.isArray(value);
}

function isNumber(value: Vector | Matrix | number): value is number{
    return typeof value === 'number';
}

export function getOrigin(): Vector {
    return {t: 0, x: 0, y: 0};
}

export function getIdentity(): Matrix {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function getZero(): Matrix {
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

export function getTimeGenerator(): Matrix {
    return [
        0, 0, 0, 1,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
    ];
}

const MAX_EXPONENT = 16;
export function getExponential(matrix: Matrix): (exponent: number) => Matrix {
    const powers: Matrix[] = [];
    // Current power divided by factorial
    let currentPower: Matrix = getIdentity();
    let currentExponent = 0;
    while(currentExponent <= MAX_EXPONENT){
        powers.push(currentPower);
        currentPower = mul(currentPower, matrix);
        currentExponent++;
        currentPower = mul(currentPower, 1/currentExponent);
    }
    powers.reverse();
    const powerMatrix = powers.reduce((a, b) => add(a, b));
    const inversePowerMatrix = powers.reduce((a, b) => add(mul(-1, a), b));
    return function getPower(exponent: number): Matrix{
        let power = getIdentity();
        while(exponent < 0){
            power = mul(power, inversePowerMatrix);
            exponent++;
        }
        while(exponent >= 1){
            power = mul(power, powerMatrix);
            exponent--;
        }
        if(exponent !== 0){
            const fracFactor = powers.reduce((a, b) => add(mul(a, exponent), b));
            power = mul(power, fracFactor);
        }
        return power;
    };
}

export function invert(matrix: Matrix): Matrix{
    const left = structuredClone(matrix);
    const right: Matrix = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
    /**
     * multiply and add into a row
     * @param src source row
     * @param dest destination row
     * @param factor factor
     */
    function madd(src: number, dest: number, factor: number){
        for(let col = 0; col < 4; col++){
            left[dest * 4 + col] += left[src * 4 + col] * factor;
            right[dest * 4 + col] += right[src * 4 + col] * factor;
        }
    }
    // Triangulation
    for(let col = 0; col < 4; col++){
        let nonZero = false;
        for(let row = col; row < 4; row++){
            if(left[row * 4 + col] !== 0) {
                madd(row, col, 1);
                nonZero = true;
                break;
            }
        }
        if(!nonZero) throw new Error('Non-invertible matrix passed');

        madd(col, col, 1 / left[col * 5] - 1);

        for(let row = col + 1; row < 4; row++){
            madd(col, row, -left[row * 4 + col]);
        }
    }

    // Eliminate upper left
    for(let col = 1; col < 4; col++){
        for(let row = 0; row < col; row++){
            madd(col, row, -left[row * 4 + col]);
        }
    }

    return right;
}

function mulMatVec(lhs: Matrix, rhs: Vector){
    return {
        t: rhs.t * lhs[0] + rhs.x * lhs[1] + rhs.y * lhs[2] + lhs[3],
        x: rhs.t * lhs[4] + rhs.x * lhs[5] + rhs.y * lhs[6] + lhs[7],
        y: rhs.t * lhs[8] + rhs.x * lhs[9] + rhs.y * lhs[10] + lhs[11],
    };
}

function mulMatMat(lhs: Matrix, rhs: Matrix): Matrix{
    return [
        (lhs[0] * rhs[0]) + (lhs[1] * rhs[4]) + (lhs[2] * rhs[8]) + (lhs[3] * rhs[12]),
        (lhs[0] * rhs[1]) + (lhs[1] * rhs[5]) + (lhs[2] * rhs[9]) + (lhs[3] * rhs[13]),
        (lhs[0] * rhs[2]) + (lhs[1] * rhs[6]) + (lhs[2] * rhs[10]) + (lhs[3] * rhs[14]),
        (lhs[0] * rhs[3]) + (lhs[1] * rhs[7]) + (lhs[2] * rhs[11]) + (lhs[3] * rhs[15]),
        (lhs[4] * rhs[0]) + (lhs[5] * rhs[4]) + (lhs[6] * rhs[8]) + (lhs[7] * rhs[12]),
        (lhs[4] * rhs[1]) + (lhs[5] * rhs[5]) + (lhs[6] * rhs[9]) + (lhs[7] * rhs[13]),
        (lhs[4] * rhs[2]) + (lhs[5] * rhs[6]) + (lhs[6] * rhs[10]) + (lhs[7] * rhs[14]),
        (lhs[4] * rhs[3]) + (lhs[5] * rhs[7]) + (lhs[6] * rhs[11]) + (lhs[7] * rhs[15]),
        (lhs[8] * rhs[0]) + (lhs[9] * rhs[4]) + (lhs[10] * rhs[8]) + (lhs[11] * rhs[12]),
        (lhs[8] * rhs[1]) + (lhs[9] * rhs[5]) + (lhs[10] * rhs[9]) + (lhs[11] * rhs[13]),
        (lhs[8] * rhs[2]) + (lhs[9] * rhs[6]) + (lhs[10] * rhs[10]) + (lhs[11] * rhs[14]),
        (lhs[8] * rhs[3]) + (lhs[9] * rhs[7]) + (lhs[10] * rhs[11]) + (lhs[11] * rhs[15]),
        (lhs[12] * rhs[0]) + (lhs[13] * rhs[4]) + (lhs[14] * rhs[8]) + (lhs[15] * rhs[12]),
        (lhs[12] * rhs[1]) + (lhs[13] * rhs[5]) + (lhs[14] * rhs[9]) + (lhs[15] * rhs[13]),
        (lhs[12] * rhs[2]) + (lhs[13] * rhs[6]) + (lhs[14] * rhs[10]) + (lhs[15] * rhs[14]),
        (lhs[12] * rhs[3]) + (lhs[13] * rhs[7]) + (lhs[14] * rhs[11]) + (lhs[15] * rhs[15]),
    ];
}

export function mul(lhs: Matrix, rhs: Matrix): Matrix;
export function mul(lhs: Matrix, rhs: Vector): Vector;
export function mul(lhs: Matrix, rhs: number): Matrix;
export function mul(lhs: number, rhs: Matrix): Matrix;
export function mul(lhs: Vector, rhs: number): Vector;
export function mul(lhs: number, rhs: Vector): Vector;
export function mul(lhs: Matrix | Vector | number, rhs: Matrix | Vector | number): Matrix | Vector {
    if(isMatrix(lhs) && isMatrix(rhs)){
        return mulMatMat(lhs, rhs);
    } else if (isMatrix(lhs) && isCoord(rhs)){
        return mulMatVec(lhs, rhs);
    } else if (isMatrix(lhs) && isNumber(rhs)){
        return lhs.map(x => x * rhs) as Matrix;
    } else if (isNumber(lhs) && isMatrix(rhs)){
        return rhs.map(x => x * lhs) as Matrix;
    } else if (isCoord(lhs) && isNumber(rhs)){
        return {
            t: lhs.t * rhs,
            x: lhs.x * rhs,
            y: lhs.y * rhs,
        };
    } else if (isNumber(lhs) && isCoord(rhs)){
        return {
            t: rhs.t * lhs,
            x: rhs.x * lhs,
            y: rhs.y * lhs,
        };
    }
    throw new Error('Invalid type signature');
}

export function add(lhs: Matrix, rhs: Matrix): Matrix;
export function add(lhs: Vector, rhs: Vector): Vector;
export function add(lhs: Matrix | Vector, rhs: Matrix | Vector) : Matrix | Vector{
    if(isMatrix(lhs) && isMatrix(rhs)){
        return lhs.map((value, index) => value + rhs[index]) as Matrix;
    } else if(isCoord(lhs) && isCoord(rhs)){
        return {
            t: lhs.t + rhs.t,
            x: lhs.x + rhs.x,
            y: lhs.y + rhs.y,
        };
    }
    throw new Error('Invalid type signature');
}
