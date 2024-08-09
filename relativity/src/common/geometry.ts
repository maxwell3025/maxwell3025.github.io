export type Coord = {
    x: number
    y: number
    t: number
};

export type LorentzTransform = {
    entries: [
        number, number, number,
        number, number, number,
        number, number, number,
    ]
};

export function invert(transform: LorentzTransform){
    const left = structuredClone(transform);
    const right: LorentzTransform = {
        entries: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    };
    /**
     * multiply and add into a row
     * @param src source row
     * @param dest destination row
     * @param factor factor
     */
    function madd(src: number, dest: number, factor: number){
        for(let col = 0; col < 3; col++){
            left.entries[dest * 3 + col] += left.entries[src * 3 + col] * factor;
            right.entries[dest * 3 + col] += right.entries[src * 3 + col] * factor;
        }
    }
    // Triangulation
    for(let col = 0; col < 3; col++){
        let nonZero = false;
        for(let row = col; row < 3; row++){
            if(left.entries[row * 3 + col] !== 0) {
                madd(row, col, 1);
                nonZero = true;
                break;
            }
        }
        if(!nonZero) throw new Error('Non-invertible matrix passed');

        madd(col, col, 1 / left.entries[col * 4] - 1);

        for(let row = col + 1; row < 3; row++){
            madd(col, row, -left.entries[row * 3 + col]);
        }
    }

    // Eliminate upper left
    for(let col = 1; col < 3; col++){
        for(let row = 0; row < col; row++){
            madd(col, row, -left.entries[row * 3 + col]);
        }
    }

    return right;
}

export function mulMatMat(lhs: LorentzTransform, rhs: LorentzTransform): LorentzTransform {
    return {
        entries: [
            (lhs.entries[0] * rhs.entries[0]) + (lhs.entries[1] * rhs.entries[3]) + (lhs.entries[2] * rhs.entries[6]),
            (lhs.entries[0] * rhs.entries[1]) + (lhs.entries[1] * rhs.entries[4]) + (lhs.entries[2] * rhs.entries[7]),
            (lhs.entries[0] * rhs.entries[2]) + (lhs.entries[1] * rhs.entries[5]) + (lhs.entries[2] * rhs.entries[8]),
            (lhs.entries[3] * rhs.entries[0]) + (lhs.entries[4] * rhs.entries[3]) + (lhs.entries[5] * rhs.entries[6]),
            (lhs.entries[3] * rhs.entries[1]) + (lhs.entries[4] * rhs.entries[4]) + (lhs.entries[5] * rhs.entries[7]),
            (lhs.entries[3] * rhs.entries[2]) + (lhs.entries[4] * rhs.entries[5]) + (lhs.entries[5] * rhs.entries[8]),
            (lhs.entries[6] * rhs.entries[0]) + (lhs.entries[7] * rhs.entries[3]) + (lhs.entries[8] * rhs.entries[6]),
            (lhs.entries[6] * rhs.entries[1]) + (lhs.entries[7] * rhs.entries[4]) + (lhs.entries[8] * rhs.entries[7]),
            (lhs.entries[6] * rhs.entries[2]) + (lhs.entries[7] * rhs.entries[5]) + (lhs.entries[8] * rhs.entries[8]),
        ],
    };
}

export function mulMatVec(lhs: LorentzTransform, rhs: Coord){
    return {
        t: rhs.t * lhs.entries[0] + rhs.x * lhs.entries[1] + rhs.y * lhs.entries[2],
        x: rhs.t * lhs.entries[3] + rhs.x * lhs.entries[4] + rhs.y * lhs.entries[5],
        y: rhs.t * lhs.entries[6] + rhs.x * lhs.entries[7] + rhs.y * lhs.entries[8],
    };
}
