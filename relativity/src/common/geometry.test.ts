import { expect, test } from 'bun:test'
import { invert } from './geometry'
test("", () => {
    const inverse = invert({
        entries: [
            1, 2, 3,
            4, 5, 6,
            7, 8, 10
        ]
    })
    expect(inverse.entries[0]).toBeCloseTo(-2/3)
    expect(inverse.entries[1]).toBeCloseTo(-4/3)
    expect(inverse.entries[2]).toBeCloseTo(1)
    expect(inverse.entries[3]).toBeCloseTo(-2/3)
    expect(inverse.entries[4]).toBeCloseTo(11/3)
    expect(inverse.entries[5]).toBeCloseTo(-2)
    expect(inverse.entries[6]).toBeCloseTo(1)
    expect(inverse.entries[7]).toBeCloseTo(-2)
    expect(inverse.entries[8]).toBeCloseTo(1)
})