import { edgeTable } from "three/examples/jsm/Addons.js";

/**
 * This follows the right-hand rule
 */
export type Vector = {
    t: number
    x: number
    y: number
};

/**
 * This follows the right hand rule
 */
export function cross(lhs: Vector, rhs: Vector): Vector {
    return {
        t: lhs.x * rhs.y - lhs.y * rhs.x,
        x: lhs.y * rhs.t - lhs.t * rhs.y,
        y: lhs.t * rhs.x - lhs.x * rhs.t,
    };
}

export function dot(lhs: Vector, rhs: Vector): number {
    return lhs.x * rhs.x +
    lhs.y * rhs.y +
    lhs.t * rhs.t;
}

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

export function sub(lhs: Matrix, rhs: Matrix): Matrix;
export function sub(lhs: Vector, rhs: Vector): Vector;
export function sub(lhs: Matrix | Vector, rhs: Matrix | Vector) : Matrix | Vector{
    if(isMatrix(lhs) && isMatrix(rhs)){
        return lhs.map((value, index) => value - rhs[index]) as Matrix;
    } else if(isCoord(lhs) && isCoord(rhs)){
        return {
            t: lhs.t - rhs.t,
            x: lhs.x - rhs.x,
            y: lhs.y - rhs.y,
        };
    }
    throw new Error('Invalid type signature');
}

/**
 * Represents an oriented line segment in spacetime
 */
export type LineSegment = [Vector, Vector];

/**
 * Represents an oriented triangle in spacetime\
 * Triangles are oriented, and I will refer the sides as the "front" and "back" sides.
 * The "front" face is the side where the vectors are counter-clockwise.
 * In other words, if you are looking at the front face, then vertices will be listed in ccl order.
 */
export type Triangle = [Vector, Vector, Vector];

/**
 * This returns the(un-normalized) normal vector for a triangle
 * @param triangle 
 * @returns 
 */
export function getNormal(triangle: Triangle): Vector {
    return cross(sub(triangle[1], triangle[0]), sub(triangle[2], triangle[0]));
}

/**
 * Finds the intersection of a line segment and a triangle.
 * The implementation technically includes boundary points(e.x. line segment crosses through a vertex of the triangle), but don't rely on it.
 * @param lhs 
 * @param rhs 
 * @returns 
 */
function intersectLineSegmentTriangle(lhs: LineSegment, rhs: Triangle): Vector | undefined{
    /**
     * Let `lhs` be segment AB
     */
    const [A, B] = lhs;
    /**
     * Let `rhs` be triangle CDE
     */
    const [C, D, E] = rhs;
    /**
     * This is the normal vector for `rhs`
     */
    const normal = cross(sub(rhs[1], rhs[0]), sub(rhs[2], rhs[0]));
    /**
     * This is the cutoff value where any vector whose dot product with
     * `normal` is greater than `planeValue` is on the front of the triangle
     */
    const planeValue = dot(normal, rhs[0]);
    /**
     * This is *proportional* to the signed perpendicular distance from pointA the plane of `rhs`.
     * This is positive iff `pointA` is in front
     */
    const distA = dot(A, normal) - planeValue;
    /**
     * This is *proportional* to the signed perpendicular distance from pointB to the plane of `rhs`.
     * This is positive iff `pointB` is in front
     */
    const distB = dot(B, normal) - planeValue;

    // No intersection is possible if both points are on the same side
    if(distA * distB > 0) return undefined;

    /**
     * This represents how far along the line segment the intersection point will be(if it exists)
     * @example 1 means that the intersection is B
     * 0 means that the intersection point is A
     * 0.5 means that the intersection point is exactly halfway between A and B
     */
    const interpValue = distA / (distA - distB);

    /**
     * The point where `lhs` intersects the plane of `rhs`
     */
    const intersection = add(mul(B, interpValue), mul(A, 1 - interpValue));

    const CD = sub(D, C);
    const DE = sub(E, D);
    const EC = sub(C, E);

    /**
     * Perpendicular to CD in plane of triangle and points to interior
     */
    const perpCD = cross(normal, CD);
    /**
     * Perpendicular to DE in plane of triangle and points to interior
     */
    const perpDE = cross(normal, DE);
    /**
     * Perpendicular to EC in plane of triangle and points to interior
     */
    const perpEC = cross(normal, EC);

    /*
    Consider a line segment S on the triangle.
    Let N be the normal vector for the triangle.
    Let K be a vector perpendicular to S and N and suppose K also points to the interior of the triangle.

    Let's consider the value V.K, where V is an arbitrary vector in the plane of the triangle.
    Notice that V.K increases as V moves from S into the triangle(and vice-versa as we move out).
    We also notice that V.K is constant for all V in S, since K is perpendicular to S.
    Let's call this constant V.S.
    Thus, V.K > V.S if V is on the interior side, and vice-versa.
    */
    const satCD = dot(intersection, perpCD) >= dot(C, perpCD);
    const satDE = dot(intersection, perpDE) >= dot(D, perpDE);
    const satEC = dot(intersection, perpEC) >= dot(E, perpEC);

    if(satCD && satDE && satEC) return intersection;

    return undefined;
}

/**
 * A mesh.\
 * This includes enough metadata to determine connections between triangles without FPE.
 */
export type Mesh = {
    points: Vector[]
    /**
     * List of triangles.
     * This is stored as a triplet of indexes.
     */
    triangles: [number, number, number][]
};

/**
 * A graph of line segments.
 */
export type LineMesh = {
    points: Vector[]
    /**
     * List of line segments.
     * This is stored as a triplet of indexes.
     */
    edges: [number, number][]
};

export function intersectCurveMesh(curve: LineMesh, mesh: Mesh): boolean{
    for(let edgeIndex = 0; edgeIndex < curve.edges.length; edgeIndex++){
        for(let triangleIndex = 0; triangleIndex < mesh.triangles.length; triangleIndex++){
            const edgeIndices = curve.edges[edgeIndex];
            const triangleIndices = mesh.triangles[triangleIndex];
            const lineSegment: LineSegment = [curve.points[edgeIndices[0]], curve.points[edgeIndices[1]]];
            const triangle: Triangle = [mesh.points[triangleIndices[0]], mesh.points[triangleIndices[1]], mesh.points[triangleIndices[2]]];
            if(intersectLineSegmentTriangle(lineSegment, triangle)) return true;
        }
    }
    return false;
}
