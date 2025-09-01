import * as THREE from "three";

/**
 * Updates a cubie's face colors after a rotation around a specific axis
 * @param {THREE.Mesh} cubie - The cubie mesh to update
 * @param {string} axis - The rotation axis ('x', 'y', 'z')
 * @param {number} direction - The rotation direction (positive or negative)
 */
export function updateCubieFaceColorsAfterRotation(cubie, axis, direction) {
    const faceColors = cubie.userData.faceColors;
    if (!faceColors) return;

    const newFaceColors = {};

    if (axis === 'x') {
        rotateFaceColorsAroundXAxis(faceColors, newFaceColors, direction);
    } else if (axis === 'y') {
        rotateFaceColorsAroundYAxis(faceColors, newFaceColors, direction);
    } else if (axis === 'z') {
        rotateFaceColorsAroundZAxis(faceColors, newFaceColors, direction);
    }

    cubie.userData.faceColors = newFaceColors;
}

/**
 * Rotates face colors around X-axis
 * @param {Object} oldColors - Original face colors
 * @param {Object} newColors - Object to store new face colors
 * @param {number} direction - Rotation direction
 */
function rotateFaceColorsAroundXAxis(oldColors, newColors, direction) {
    if (direction > 0) {
        // Clockwise around X-axis
        newColors.up = oldColors.back;
        newColors.back = oldColors.down;
        newColors.down = oldColors.front;
        newColors.front = oldColors.up;
        newColors.left = oldColors.left;
        newColors.right = oldColors.right;
    } else {
        // Counter-clockwise around X-axis
        newColors.up = oldColors.front;
        newColors.front = oldColors.down;
        newColors.down = oldColors.back;
        newColors.back = oldColors.up;
        newColors.left = oldColors.left;
        newColors.right = oldColors.right;
    }
}

/**
 * Rotates face colors around Y-axis
 * @param {Object} oldColors - Original face colors
 * @param {Object} newColors - Object to store new face colors
 * @param {number} direction - Rotation direction
 */
function rotateFaceColorsAroundYAxis(oldColors, newColors, direction) {
    if (direction > 0) {
        // Clockwise around Y-axis
        newColors.front = oldColors.left;
        newColors.left = oldColors.back;
        newColors.back = oldColors.right;
        newColors.right = oldColors.front;
        newColors.up = oldColors.up;
        newColors.down = oldColors.down;
    } else {
        // Counter-clockwise around Y-axis
        newColors.front = oldColors.right;
        newColors.right = oldColors.back;
        newColors.back = oldColors.left;
        newColors.left = oldColors.front;
        newColors.up = oldColors.up;
        newColors.down = oldColors.down;
    }
}

/**
 * Rotates face colors around Z-axis
 * @param {Object} oldColors - Original face colors
 * @param {Object} newColors - Object to store new face colors
 * @param {number} direction - Rotation direction
 */
function rotateFaceColorsAroundZAxis(oldColors, newColors, direction) {
    if (direction > 0) {
        // Clockwise around Z-axis
        newColors.up = oldColors.left;
        newColors.left = oldColors.down;
        newColors.down = oldColors.right;
        newColors.right = oldColors.up;
        newColors.front = oldColors.front;
        newColors.back = oldColors.back;
    } else {
        // Counter-clockwise around Z-axis
        newColors.up = oldColors.right;
        newColors.right = oldColors.down;
        newColors.down = oldColors.left;
        newColors.left = oldColors.up;
        newColors.front = oldColors.front;
        newColors.back = oldColors.back;
    }
}
