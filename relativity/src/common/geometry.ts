export type Vector = {
    t: number
    x: number
    y: number
};

export type Matrix = [
    number, number, number,
    number, number, number,
    number, number, number,
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

export function getIdentity(): Matrix {
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
}

export function getZero(): Matrix {
    return [0, 0, 0, 0, 0, 0, 0, 0, 0];
}

const MAX_EXPONENT = 16;
export function getGenerator(matrix: Matrix): (exponent: number) => Matrix {
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
    const right: Matrix = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
    /**
     * multiply and add into a row
     * @param src source row
     * @param dest destination row
     * @param factor factor
     */
    function madd(src: number, dest: number, factor: number){
        for(let col = 0; col < 3; col++){
            left[dest * 3 + col] += left[src * 3 + col] * factor;
            right[dest * 3 + col] += right[src * 3 + col] * factor;
        }
    }
    // Triangulation
    for(let col = 0; col < 3; col++){
        let nonZero = false;
        for(let row = col; row < 3; row++){
            if(left[row * 3 + col] !== 0) {
                madd(row, col, 1);
                nonZero = true;
                break;
            }
        }
        if(!nonZero) throw new Error('Non-invertible matrix passed');

        madd(col, col, 1 / left[col * 4] - 1);

        for(let row = col + 1; row < 3; row++){
            madd(col, row, -left[row * 3 + col]);
        }
    }

    // Eliminate upper left
    for(let col = 1; col < 3; col++){
        for(let row = 0; row < col; row++){
            madd(col, row, -left[row * 3 + col]);
        }
    }

    return right;
}

function mulMatVec(lhs: Matrix, rhs: Vector){
    return {
        t: rhs.t * lhs[0] + rhs.x * lhs[1] + rhs.y * lhs[2],
        x: rhs.t * lhs[3] + rhs.x * lhs[4] + rhs.y * lhs[5],
        y: rhs.t * lhs[6] + rhs.x * lhs[7] + rhs.y * lhs[8],
    };
}

function mulMatMat(lhs: Matrix, rhs: Matrix): Matrix{
    return [
        (lhs[0] * rhs[0]) + (lhs[1] * rhs[3]) + (lhs[2] * rhs[6]),
        (lhs[0] * rhs[1]) + (lhs[1] * rhs[4]) + (lhs[2] * rhs[7]),
        (lhs[0] * rhs[2]) + (lhs[1] * rhs[5]) + (lhs[2] * rhs[8]),
        (lhs[3] * rhs[0]) + (lhs[4] * rhs[3]) + (lhs[5] * rhs[6]),
        (lhs[3] * rhs[1]) + (lhs[4] * rhs[4]) + (lhs[5] * rhs[7]),
        (lhs[3] * rhs[2]) + (lhs[4] * rhs[5]) + (lhs[5] * rhs[8]),
        (lhs[6] * rhs[0]) + (lhs[7] * rhs[3]) + (lhs[8] * rhs[6]),
        (lhs[6] * rhs[1]) + (lhs[7] * rhs[4]) + (lhs[8] * rhs[7]),
        (lhs[6] * rhs[2]) + (lhs[7] * rhs[5]) + (lhs[8] * rhs[8]),
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
