import { expect, test } from 'bun:test';
import { getDefaultAction, getNextEntry, getSpacetimePosition, HistoryEntry, Player } from "./common";
import { Matrix, mul, Vector } from './geometry';

test("getNextEntry basic", () => {
    /** 1 time unit in. Will thrust for 1 second proper time in (1, 1) */
    const currentState: HistoryEntry = {
        transform: [
            1, 0, 0, 1,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ],
        action: {
            actionType: "thrust",
            x: 1,
            y: 1,
        },
    };

    const finalState = getNextEntry(currentState);

    /**
     * Classically, we would expect t=2, x=0.5, y=0.5
     * 
     * In special relativity, we expect both to be greater due to time dilation.
     */
    const finalPosition = mul(finalState.transform, {t: 0, x: 0, y: 0});

    expect(finalPosition.t).toBeCloseTo(2.368);
    expect(finalPosition.x).toBeCloseTo(0.589);
    expect(finalPosition.y).toBeCloseTo(0.589);
});

test("getSpacetimePosition basic", () => {
    const initialTransform: Matrix = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
    ];

    const examplePlayer: Player = {
        id: "example",
        antimatter: 1,
        matter: 1,
        history: [
            {
                transform: [
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1,
                ],
                action: {
                    actionType: "thrust",
                    x: 0,
                    y: 0,
                },
            },
            {
                transform: [
                    1, 0, 0, 1,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1,
                ],
                action: {
                    actionType: "thrust",
                    x: 1,
                    y: 1,
                },
            },
        ],
        clientTransform: initialTransform,
        finalTransform: initialTransform,
        currentAction: getDefaultAction(),
    };

    const position = getSpacetimePosition(examplePlayer, 1.50);

    expect(position).toBeDefined();
    expect(position!.t).toBeCloseTo(1.542);
    expect(position!.x).toBeCloseTo(0.130);
    expect(position!.y).toBeCloseTo(0.130);
});