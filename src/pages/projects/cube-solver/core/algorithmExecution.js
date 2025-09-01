import { animateLayerRotation } from "./rotationAnimations";
import { ROTATION_AXIS_MAP } from "../constants/config";

/**
 * Executes a Rubik's cube solving algorithm
 * @param {React.RefObject} cubeGroupRef - Reference to the cube group
 * @param {Array<Object>} moveSequence - Array of moves to execute
 * @returns {Promise<void>} Promise that resolves when algorithm completes
 */
export async function executeSolvingAlgorithm(cubeGroupRef, moveSequence = null) {
    if (!cubeGroupRef?.current) {
        console.error("No cube group reference provided for algorithm execution");
        return;
    }

    // Default test sequence
    const defaultMoveSequence = [
        { move: "R", direction: "cw" },
        { move: "U", direction: "cw" }
    ];

    const moves = moveSequence || defaultMoveSequence;
    
    console.log("🚀 Starting cube solving algorithm with moves:", moves);

    await executeSequentialMoves(cubeGroupRef, moves);
    
    console.log("🏁 Algorithm execution completed");
}

/**
 * Executes moves in sequence, waiting for each to complete
 * @param {React.RefObject} cubeGroupRef - Reference to the cube group
 * @param {Array<Object>} moves - Array of move objects
 */
async function executeSequentialMoves(cubeGroupRef, moves) {
    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        console.log(`➡️ Executing move ${i + 1}/${moves.length}: ${move.move} ${move.direction}`);
        
        await executeSingleMove(cubeGroupRef, move);
        
        // Small delay between moves for better visualization
        await delay(100);
    }
}

/**
 * Executes a single cube move
 * @param {React.RefObject} cubeGroupRef - Reference to the cube group
 * @param {Object} moveSpec - Move specification {move: string, direction: string}
 */
async function executeSingleMove(cubeGroupRef, moveSpec) {
    const { move, direction } = moveSpec;
    
    const axisMapping = ROTATION_AXIS_MAP[move];
    if (!axisMapping) {
        console.warn(`Unknown move: ${move}`);
        return;
    }

    const { axis, value } = axisMapping;
    const rotationAngle = calculateRotationAngle(direction);
    
    await animateLayerRotation(cubeGroupRef, axis, value, rotationAngle);
}

/**
 * Calculates the rotation angle based on direction
 * @param {string} direction - "cw" for clockwise, "ccw" for counter-clockwise
 * @returns {number} Rotation angle in radians
 */
function calculateRotationAngle(direction) {
    const quarterTurn = Math.PI / 2;
    return direction === "cw" ? quarterTurn : -quarterTurn;
}

/**
 * Creates a delay for better move visualization
 * @param {number} milliseconds - Delay in milliseconds
 * @returns {Promise<void>} Promise that resolves after the delay
 */
function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
