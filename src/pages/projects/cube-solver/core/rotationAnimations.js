import * as THREE from "three";
import { updateCubieFaceColorsAfterRotation } from "../utils/faceColorRotation";
import { updateCubeState } from "./cubeGeometry";
import { ANIMATION_CONFIG } from "../constants/config";

const { ROTATION_SPEED } = ANIMATION_CONFIG;

/**
 * Rotates a layer of the cube with smooth animation
 * @param {React.RefObject} cubeGroupRef - Reference to the cube group
 * @param {string} axis - Rotation axis ('x', 'y', 'z') 
 * @param {number} layerValue - Layer position value (-1, 0, 1)
 * @param {number} totalAngle - Total rotation angle in radians
 * @returns {Promise<void>} Promise that resolves when animation completes
 */
export function animateLayerRotation(cubeGroupRef, axis, layerValue, totalAngle) {
    return new Promise(resolve => {
        const cubeGroup = cubeGroupRef.current;
        if (!cubeGroup) {
            console.warn("No cube group found for rotation");
            resolve();
            return;
        }

        const layerCubies = findCubiesInLayer(cubeGroup, axis, layerValue);
        if (layerCubies.length === 0) {
            console.warn(`No cubies found in layer ${axis}=${layerValue}`);
            resolve();
            return;
        }

        const layerCenter = calculateLayerCenter(layerCubies);
        const rotationAxis = createRotationAxis(axis);
        
        animateRotation(layerCubies, layerCenter, rotationAxis, totalAngle, axis, resolve);
    });
}

/**
 * Finds all cubies in a specific layer
 * @param {THREE.Group} cubeGroup - The cube group containing all cubies
 * @param {string} axis - The axis to check ('x', 'y', 'z')
 * @param {number} layerValue - The layer position value
 * @returns {Array<THREE.Mesh>} Array of cubies in the layer
 */
function findCubiesInLayer(cubeGroup, axis, layerValue) {
    const layerCubies = [];
    
    cubeGroup.traverse(cubie => {
        if (cubie.userData?.faceColors) {
            const position = Math.round(cubie.position[axis]);
            if (position === layerValue) {
                layerCubies.push(cubie);
            }
        }
    });

    return layerCubies;
}

/**
 * Calculates the center point of a layer for rotation pivot
 * @param {Array<THREE.Mesh>} cubies - Array of cubies in the layer
 * @returns {THREE.Vector3} The center point
 */
function calculateLayerCenter(cubies) {
    const center = new THREE.Vector3();
    cubies.forEach(cubie => center.add(cubie.position));
    center.divideScalar(cubies.length);
    return center;
}

/**
 * Creates a rotation axis vector
 * @param {string} axis - The axis name ('x', 'y', 'z')
 * @returns {THREE.Vector3} The rotation axis vector
 */
function createRotationAxis(axis) {
    return new THREE.Vector3(
        axis === "x" ? 1 : 0,
        axis === "y" ? 1 : 0,
        axis === "z" ? 1 : 0
    );
}

/**
 * Performs the actual rotation animation
 * @param {Array<THREE.Mesh>} cubies - Cubies to rotate
 * @param {THREE.Vector3} center - Rotation center
 * @param {THREE.Vector3} rotationAxis - Rotation axis
 * @param {number} totalAngle - Total angle to rotate
 * @param {string} axis - Original axis name
 * @param {Function} resolve - Promise resolve function
 */
function animateRotation(cubies, center, rotationAxis, totalAngle, axis, resolve) {
    let rotatedAngle = 0;

    function animateStep() {
        const remainingAngle = totalAngle - rotatedAngle;
        const stepAngle = Math.sign(totalAngle) * Math.min(Math.abs(remainingAngle), ROTATION_SPEED);

        // Rotate each cubie
        for (const cubie of cubies) {
            rotateCubieStep(cubie, center, rotationAxis, stepAngle);
        }

        rotatedAngle += stepAngle;

        // Check if rotation is complete
        if (Math.abs(remainingAngle) > 1e-3) {
            requestAnimationFrame(animateStep);
        } else {
            finishRotation(cubies, axis, totalAngle);
            setTimeout(resolve, 0);
        }
    }

    requestAnimationFrame(animateStep);
}

/**
 * Rotates a single cubie by one animation step
 * @param {THREE.Mesh} cubie - The cubie to rotate
 * @param {THREE.Vector3} center - Rotation center
 * @param {THREE.Vector3} rotationAxis - Rotation axis
 * @param {number} stepAngle - Angle for this step
 */
function rotateCubieStep(cubie, center, rotationAxis, stepAngle) {
    // Move cubie relative to center, rotate, then move back
    cubie.position.sub(center);
    cubie.position.applyAxisAngle(rotationAxis, stepAngle);
    cubie.position.add(center);
    
    // Rotate the cubie's orientation
    cubie.rotateOnAxis(rotationAxis, stepAngle);
}

/**
 * Finalizes the rotation by snapping positions and updating state
 * @param {Array<THREE.Mesh>} cubies - The rotated cubies
 * @param {string} axis - The rotation axis
 * @param {number} totalAngle - The total rotation angle
 */
function finishRotation(cubies, axis, totalAngle) {
    const isClockwise = totalAngle > 0;

    cubies.forEach(cubie => {
        // Update face colors based on rotation
        updateCubieFaceColorsAfterRotation(cubie, axis, isClockwise ? 1 : -1);
        
        // Snap position to integer grid
        snapCubiePosition(cubie);
        
        // Snap rotation to nearest 90 degrees
        snapCubieRotation(cubie);
    });

    // Update global cube state
    const faceLetter = convertAxisToFaceLetter(axis, totalAngle);
    if (faceLetter) {
        updateCubeState(faceLetter, isClockwise);
    }
}

/**
 * Snaps cubie position to integer coordinates
 * @param {THREE.Mesh} cubie - The cubie to snap
 */
function snapCubiePosition(cubie) {
    cubie.position.x = Math.round(cubie.position.x);
    cubie.position.y = Math.round(cubie.position.y);
    cubie.position.z = Math.round(cubie.position.z);
}

/**
 * Snaps cubie rotation to nearest 90-degree increments
 * @param {THREE.Mesh} cubie - The cubie to snap
 */
function snapCubieRotation(cubie) {
    const quarterTurn = Math.PI / 2;
    cubie.rotation.x = Math.round(cubie.rotation.x / quarterTurn) * quarterTurn;
    cubie.rotation.y = Math.round(cubie.rotation.y / quarterTurn) * quarterTurn;
    cubie.rotation.z = Math.round(cubie.rotation.z / quarterTurn) * quarterTurn;
}

/**
 * Converts axis and angle to face letter notation
 * @param {string} axis - The rotation axis
 * @param {number} angle - The rotation angle
 * @returns {string|null} The face letter (U, D, F, B, L, R) or null
 */
function convertAxisToFaceLetter(axis, angle) {
    const isPositive = angle > 0;
    
    if (axis === "x") return isPositive ? "R" : "L";
    if (axis === "y") return isPositive ? "U" : "D";
    if (axis === "z") return isPositive ? "F" : "B";
    
    return null;
}
