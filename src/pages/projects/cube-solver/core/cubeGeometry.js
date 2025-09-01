import * as THREE from "three";
import { COLOR_HEX_MAP, DEFAULT_CUBE_STATE } from "../constants/colors";
import { ANIMATION_CONFIG, SCENE_CONFIG } from "../constants/config";

// Utility function to get color hex from color name
export function getColorHex(color) {
    return COLOR_HEX_MAP[color.toLowerCase()] || "#000000";
}

// Global cube state - represents the current state of the cube
export const cubeState = { ...DEFAULT_CUBE_STATE };

/**
 * Creates the 3D cube group with all individual cubes (cubies)
 * @returns {THREE.Group} The complete cube group
 */
export function createCubeGroup() {
    const group = new THREE.Group();
    const { SMALL_CUBE_SIZE, CUBE_SPACING } = ANIMATION_CONFIG;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const cubie = createSingleCubie(x, y, z, SMALL_CUBE_SIZE, CUBE_SPACING);
                group.add(cubie);
            }
        }
    }

    return group;
}

/**
 * Creates a single cubie with appropriate face colors
 * @param {number} x - X position (-1, 0, 1)
 * @param {number} y - Y position (-1, 0, 1)
 * @param {number} z - Z position (-1, 0, 1)
 * @param {number} size - Size of the cubie
 * @param {number} spacing - Spacing between cubies
 * @returns {THREE.Mesh} The cubie mesh
 */
function createSingleCubie(x, y, z, size, spacing) {
    let geometry = new THREE.BoxGeometry(size, size, size);
    geometry = geometry.toNonIndexed();

    const faceMaterials = createCubieFaceMaterials(x, y, z);
    const cubie = new THREE.Mesh(geometry, faceMaterials);
    
    cubie.position.set(x * spacing, y * spacing, z * spacing);
    cubie.userData.faceColors = createCubieFaceColorData(x, y, z);

    return cubie;
}

/**
 * Creates the face materials for a cubie based on its position
 * @param {number} x - X position
 * @param {number} y - Y position  
 * @param {number} z - Z position
 * @returns {Array<THREE.MeshBasicMaterial>} Array of 6 face materials
 */
function createCubieFaceMaterials(x, y, z) {
    const faceMaterials = Array(6).fill(null).map(() => 
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );

    // Set colors based on position (only exterior faces get colors)
    if (x === 1) faceMaterials[0].color.set(0xff0000);  // Right - Red
    if (x === -1) faceMaterials[1].color.set(0xffa500); // Left - Orange
    if (y === 1) faceMaterials[2].color.set(0xffffff);  // Top - White
    if (y === -1) faceMaterials[3].color.set(0xffff00); // Bottom - Yellow
    if (z === 1) faceMaterials[4].color.set(0x0000ff);  // Front - Blue
    if (z === -1) faceMaterials[5].color.set(0x00ff00); // Back - Green

    return faceMaterials;
}

/**
 * Creates the face color data for a cubie's userData
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @returns {Object} Face colors object
 */
function createCubieFaceColorData(x, y, z) {
    const faceColors = {};
    
    if (x === 1) faceColors.right = "red";
    if (x === -1) faceColors.left = "orange";
    if (y === 1) faceColors.up = "white";
    if (y === -1) faceColors.down = "yellow";
    if (z === 1) faceColors.front = "blue";
    if (z === -1) faceColors.back = "green";

    return faceColors;
}

/**
 * Updates the cube's internal state after a move
 * @param {string} face - The face that was rotated (U, D, F, B, L, R)
 * @param {boolean} clockwise - Whether the rotation was clockwise
 */
export function updateCubeState(face, clockwise = true) {
    console.log(`Updating cube state: ${face} ${clockwise ? 'clockwise' : 'counterclockwise'}`);
    
    // Import mapping here to avoid circular dependencies
    import('../constants/cubeMapping').then(({ CUBE_MOVE_MAPPING }) => {
        const moves = CUBE_MOVE_MAPPING[face][clockwise ? 'clockwise' : 'counterClockwise'];
        const newState = JSON.parse(JSON.stringify(cubeState));

        for (const [from, to] of moves) {
            newState[to.face][to.index] = cubeState[from.face][from.index];
        }

        Object.assign(cubeState, newState);
    });
}

/**
 * Refreshes the visual colors of all cubies based on their face color data
 * @param {Array<THREE.Mesh>} cubies - Array of cubie meshes
 */
export function refreshCubeVisualColors(cubies) {
    for (const cubie of cubies) {
        const faceColors = cubie.userData.faceColors || {};
        const materials = cubie.material;

        if (!Array.isArray(materials)) continue;

        // Update each face material based on stored face colors
        updateCubieFaceMaterial(materials[0], faceColors.right);   // Right face
        updateCubieFaceMaterial(materials[1], faceColors.left);    // Left face  
        updateCubieFaceMaterial(materials[2], faceColors.up);      // Up face
        updateCubieFaceMaterial(materials[3], faceColors.down);    // Down face
        updateCubieFaceMaterial(materials[4], faceColors.front);   // Front face
        updateCubieFaceMaterial(materials[5], faceColors.back);    // Back face
    }
}

/**
 * Updates a single face material with a new color
 * @param {THREE.MeshBasicMaterial} material - The material to update
 * @param {string} colorName - The color name to set
 */
function updateCubieFaceMaterial(material, colorName) {
    if (colorName !== undefined && material) {
        material.color.set(getColorHex(colorName));
    }
}
