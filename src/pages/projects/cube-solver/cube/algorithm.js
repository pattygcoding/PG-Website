import { rotateLayer } from "./rotations";

const ROTATION_MAP = {
    U: { axis: 'y', value: 1 },
    D: { axis: 'y', value: -1 },
    F: { axis: 'z', value: 1 },
    B: { axis: 'z', value: -1 },
    R: { axis: 'x', value: 1 },
    L: { axis: 'x', value: -1 },
};

export async function algorithm(cubeGroupRef) {
    if (!cubeGroupRef?.current) {
        console.error("No cube group to operate on");
        return;
    }

    const moveList = [
        { move: "F", direction: "ccw" },
        { move: "U", direction: "cw" },
        { move: "R", direction: "cw" },
        { move: "U", direction: "cw" },
    ];

    console.log("🚀 Starting algorithm with moveList:", moveList);

    for (const move of moveList) {
        console.log("➡️ Starting move:", move.move, move.direction);
        await performMove(cubeGroupRef, move);
        console.log("✅ Finished move:", move.move, move.direction);
    }

    console.log("🏁 Finished all moves");
}

async function performMove(cubeGroupRef, { move, direction }) {
    const mapping = ROTATION_MAP[move];
    if (!mapping) {
        console.error("Unknown move:", move);
        return;
    }

    const { axis, value } = mapping;
    const angle = direction === "cw" ? Math.PI / 2 : -Math.PI / 2;

    console.log("📦 performMove:", { axis, value, angle });
    await rotateLayer(cubeGroupRef, axis, value, angle);
}
