import { rotateLayer } from "./rotations";
import { updateCubeState } from "./cube";


const ROTATION_MAP = {
    U: { axis: 'y', value: 1 },
    D: { axis: 'y', value: -1 },
    F: { axis: 'z', value: 1 },
    B: { axis: 'z', value: -1 },
    R: { axis: 'x', value: 1 },
    L: { axis: 'x', value: -1 },
};

export function algorithm(cubeGroupRef) {
    if (!cubeGroupRef?.current) {
        console.error("No cube group to operate on");
        return;
    }

    const moveList = [
        { move: "R", direction: "cw" },
        { move: "U", direction: "cw" }
    ];

    console.log("🚀 Starting algorithm with moveList:", moveList);

    runMoveSequence(cubeGroupRef, moveList, 0);
}

function runMoveSequence(cubeGroupRef, moveList, index) {
    if (index >= moveList.length) {
        console.log("🏁 Finished all moves");
        return;
    }

    const move = moveList[index];
    console.log("➡️ Starting move:", move.move, move.direction);

    performMove(cubeGroupRef, move)
        .then(() => {
            runMoveSequence(cubeGroupRef, moveList, index + 1);
        });
}

async function performMove(cubeGroupRef, { move, direction }) {
    const mapping = ROTATION_MAP[move];
    if (!mapping) {
        return;
    }

    const { axis, value } = mapping;
    const angle = direction === "cw" ? Math.PI / 2 : -Math.PI / 2;

    await rotateLayer(cubeGroupRef, axis, value, angle);

    updateCubeState(move, direction === "cw");
}
