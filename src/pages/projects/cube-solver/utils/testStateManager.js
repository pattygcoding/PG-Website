import * as THREE from "three";
import Cube from "cubejs";
import { getColorHex } from "../core/cubeGeometry";
import { ANIMATION_CONFIG } from "../constants/config";

// Predefined test cube state as a Cube.js facelet string
// Face order: U R F D L B, each face read left-to-right, top-to-bottom
// U=White, R=Red, F=Blue, D=Yellow, L=Orange, B=Green
const TEST_CUBE_FACELET_STRING = "ULRUUDFFDLBBDBLFRLRUBLLFFFDDRLDDBUUBRRUDFFFRRDBBURLUBL";

// Mapping from Cube.js face letters to project color letters
const CUBEJS_TO_COLOR = {
    U: "W", // Up    = White
    D: "Y", // Down  = Yellow
    F: "B", // Front = Blue
    B: "G", // Back  = Green
    L: "O", // Left  = Orange
    R: "R", // Right = Red
};

/**
 * Converts a Cube.js facelet string into the internal TEST_CUBE_STATE format
 * @param {string} faceletString - 54-character Cube.js facelet string (U R F D L B order)
 * @returns {Object} Cube state object with face names as keys and 3x3 color arrays as values
 */
function parseCubejsState(faceletString) {
    // Cube.js string order: U(0-8), R(9-17), F(18-26), D(27-35), L(36-44), B(45-53)
    const faceOffsets = { Top: 0, Right: 9, Front: 18, Bottom: 27, Left: 36, Back: 45 };

    const state = {};
    for (const [faceName, offset] of Object.entries(faceOffsets)) {
        const rows = [];
        for (let row = 0; row < 3; row++) {
            const cols = [];
            for (let col = 0; col < 3; col++) {
                const faceLetter = faceletString[offset + row * 3 + col];
                cols.push(CUBEJS_TO_COLOR[faceLetter]);
            }
            rows.push(cols);
        }
        state[faceName] = rows;
    }
    return state;
}

// Build the test cube state from the Cube.js facelet string
const TEST_CUBE_STATE = parseCubejsState(TEST_CUBE_FACELET_STRING);

// Configuration for each face's orientation and mapping
const FACE_CONFIGURATIONS = {
    Top: { 
        normal: new THREE.Vector3(0, 1, 0), 
        u: 'x', v: 'z', 
        flipU: false, flipV: true 
    },
    Bottom: { 
        normal: new THREE.Vector3(0, -1, 0), 
        u: 'x', v: 'z', 
        flipU: false, flipV: false 
    },
    Left: { 
        normal: new THREE.Vector3(-1, 0, 0), 
        u: 'z', v: 'y', 
        flipU: false, flipV: false 
    },
    Right: { 
        normal: new THREE.Vector3(1, 0, 0), 
        u: 'z', v: 'y', 
        flipU: true, flipV: false 
    },
    Front: { 
        normal: new THREE.Vector3(0, 0, 1), 
        u: 'x', v: 'y', 
        flipU: false, flipV: false 
    },
    Back: { 
        normal: new THREE.Vector3(0, 0, -1), 
        u: 'x', v: 'y', 
        flipU: true, flipV: false 
    },
};

/**
 * Applies a predefined test state to the cube for demonstration
 * @param {React.RefObject} cubeGroupRef - Reference to the cube group
 */
export function applyTestCubeState(cubeGroupRef) {
    if (!cubeGroupRef?.current) {
        console.error("No cube group reference found for test state application");
        return;
    }

    console.log("Applying test cube state...");

    Object.entries(TEST_CUBE_STATE).forEach(([faceName, faceColors]) => {
        applyFaceTestState(cubeGroupRef, faceName, faceColors);
    });

    console.log("Test cube state applied successfully");
}

/**
 * Applies test state colors to a specific face of the cube
 * @param {React.RefObject} cubeGroupRef - Reference to the cube group
 * @param {string} faceName - Name of the face (Top, Front, etc.)
 * @param {Array<Array<string>>} faceColors - 3x3 array of color letters
 */
function applyFaceTestState(cubeGroupRef, faceName, faceColors) {
    const faceConfig = FACE_CONFIGURATIONS[faceName];
    if (!faceConfig) {
        console.warn(`Unknown face configuration: ${faceName}`);
        return;
    }

    const stickers = findFaceStickers(cubeGroupRef.current, faceConfig.normal);
    
    if (stickers.length !== 9) {
        console.warn(`Expected 9 stickers for ${faceName} but found ${stickers.length}`);
        return;
    }

    stickers.forEach(sticker => {
        const gridPosition = calculateStickerGridPosition(sticker.mesh, faceConfig);
        const colorLetter = faceColors[gridPosition.row][gridPosition.col];
        applyStickerColor(sticker, colorLetter);
    });
}

/**
 * Finds all stickers on a specific face of the cube
 * @param {THREE.Group} cubeGroup - The cube group
 * @param {THREE.Vector3} targetNormal - The normal vector of the target face
 * @returns {Array<Object>} Array of sticker objects with mesh and faceIndex
 */
function findFaceStickers(cubeGroup, targetNormal) {
    const stickers = [];
    const { SURFACE_THRESHOLD } = ANIMATION_CONFIG;

    for (const cubie of cubeGroup.children) {
        if (!cubie.userData?.faceColors) continue;

        // Check if cubie is on the target face surface
        if (!isCubieOnFaceSurface(cubie.position, targetNormal, SURFACE_THRESHOLD)) {
            continue;
        }

        // Find which face of this cubie matches the target normal
        const stickerFaceIndex = findMatchingFaceIndex(cubie, targetNormal);
        if (stickerFaceIndex !== -1) {
            stickers.push({ mesh: cubie, faceIndex: stickerFaceIndex });
        }
    }

    return stickers;
}

/**
 * Checks if a cubie is on the surface of a specific face
 * @param {THREE.Vector3} position - Cubie position
 * @param {THREE.Vector3} normal - Face normal vector
 * @param {number} threshold - Distance threshold
 * @returns {boolean} True if cubie is on the face surface
 */
function isCubieOnFaceSurface(position, normal, threshold) {
    return (
        (normal.x === 1 && Math.abs(position.x - 1) <= threshold) ||
        (normal.x === -1 && Math.abs(position.x + 1) <= threshold) ||
        (normal.y === 1 && Math.abs(position.y - 1) <= threshold) ||
        (normal.y === -1 && Math.abs(position.y + 1) <= threshold) ||
        (normal.z === 1 && Math.abs(position.z - 1) <= threshold) ||
        (normal.z === -1 && Math.abs(position.z + 1) <= threshold)
    );
}

/**
 * Finds the face index that matches the target normal
 * @param {THREE.Mesh} cubie - The cubie mesh
 * @param {THREE.Vector3} targetNormal - Target normal vector
 * @returns {number} Face index or -1 if not found
 */
function findMatchingFaceIndex(cubie, targetNormal) {
    for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
        const localNormal = getFaceNormalByIndex(faceIndex);
        const worldNormal = localNormal.clone().applyQuaternion(cubie.quaternion);

        const alignment = worldNormal.dot(targetNormal);
        if (alignment > 0.95) { // Close enough to be considered aligned
            return faceIndex;
        }
    }
    return -1;
}

/**
 * Gets the normal vector for a face by its index
 * @param {number} index - Face index (0-5)
 * @returns {THREE.Vector3} Normal vector for the face
 */
function getFaceNormalByIndex(index) {
    const normals = [
        new THREE.Vector3(1, 0, 0),   // right
        new THREE.Vector3(-1, 0, 0),  // left
        new THREE.Vector3(0, 1, 0),   // top
        new THREE.Vector3(0, -1, 0),  // bottom
        new THREE.Vector3(0, 0, 1),   // front
        new THREE.Vector3(0, 0, -1),  // back
    ];
    
    return normals[index] || new THREE.Vector3(0, 0, 0);
}

/**
 * Calculates the grid position (row, col) for a sticker
 * @param {THREE.Mesh} mesh - The cubie mesh
 * @param {Object} faceConfig - Face configuration object
 * @returns {Object} Object with row and col properties
 */
function calculateStickerGridPosition(mesh, faceConfig) {
    const { u, v, flipU, flipV } = faceConfig;
    
    const uPos = mesh.position[u];
    const vPos = mesh.position[v];

    let row = vPos > 0.5 ? 0 : vPos < -0.5 ? 2 : 1;
    let col = uPos > 0.5 ? 2 : uPos < -0.5 ? 0 : 1;

    if (flipU) col = 2 - col;
    if (flipV) row = 2 - row;

    return { row, col };
}

/**
 * Applies a color to a specific sticker
 * @param {Object} sticker - Sticker object with mesh and faceIndex
 * @param {string} colorLetter - Single letter color code
 */
function applyStickerColor(sticker, colorLetter) {
    const { mesh, faceIndex } = sticker;
    
    if (!Array.isArray(mesh.material) || !mesh.material[faceIndex]) {
        console.error(`Invalid material structure for sticker at face index ${faceIndex}`);
        return;
    }

    const colorHex = getColorHex(colorLetter.toLowerCase());
    mesh.material[faceIndex].color.set(colorHex);
    mesh.material[faceIndex].needsUpdate = true;
}
