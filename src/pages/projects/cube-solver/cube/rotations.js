import * as THREE from "three";
import { rotateFaceColorsForAxis } from "./faceRotationHelpers";
import { updateCubeState } from "./cube";

const ROTATION_SPEED = Math.PI / 60; // Smooth rotation

export function rotateLayer(cubeGroupRef, axis, value, totalAngle) {
    return new Promise((resolve) => {
        if (!cubeGroupRef?.current) {
            resolve();
            return;
        }

        const layerCubies = cubeGroupRef.current.children.filter(cubie => {
            const pos = cubie.position[axis];
            return Math.abs(pos - value) < 0.2;
        });

        if (layerCubies.length === 0) {
            console.warn(`⚠️ No cubies found for ${axis} = ${value}`);
            resolve();
            return;
        }

        const rotationAxis = new THREE.Vector3(
            axis === 'x' ? 1 : 0,
            axis === 'y' ? 1 : 0,
            axis === 'z' ? 1 : 0
        );

        const center = new THREE.Vector3(0, 0, 0);
        let rotated = 0;

        function animate() {
            const delta = Math.sign(totalAngle) * Math.min(Math.abs(totalAngle - rotated), ROTATION_SPEED);

            for (const cubie of layerCubies) {
                cubie.position.sub(center);
                cubie.position.applyAxisAngle(rotationAxis, delta);
                cubie.position.add(center);
                cubie.rotateOnAxis(rotationAxis, delta);
            }

            rotated += delta;

            if (Math.abs(totalAngle - rotated) > 0.001) {
                requestAnimationFrame(animate);
            } else {

                for (const cubie of layerCubies) {
                    rotateFaceColorsForAxis(cubie, axis, Math.sign(totalAngle));
                    remapCubieFaceColors(cubie, axis, Math.sign(totalAngle) > 0);

                    cubie.position.x = Math.round(cubie.position.x);
                    cubie.position.y = Math.round(cubie.position.y);
                    cubie.position.z = Math.round(cubie.position.z);

                    cubie.rotation.x = Math.round(cubie.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
                    cubie.rotation.y = Math.round(cubie.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
                    cubie.rotation.z = Math.round(cubie.rotation.z / (Math.PI / 2)) * (Math.PI / 2);
                }

                const faceLetter = axisToFaceLetter(axis, value);
                const clockwise = Math.sign(totalAngle) > 0;
                if (faceLetter) {
                    updateCubeState(faceLetter, clockwise);
                }
                setTimeout(() => {
                    resolve();
                }, 0);
            }
        }

        requestAnimationFrame(animate);
    });
}

function axisToFaceLetter(axis, value) {
    if (axis === 'x') {
        return value > 0 ? 'R' : 'L';
    }
    if (axis === 'y') {
        return value > 0 ? 'U' : 'D';
    }
    if (axis === 'z') {
        return value > 0 ? 'F' : 'B';
    }
    return null;
}

function remapCubieFaceColors(cubie, axis, clockwise) {
    const oldColors = { ...cubie.userData.faceColors };

    if (axis === 'x') {
        if (clockwise) {
            cubie.userData.faceColors.up = oldColors.front;
            cubie.userData.faceColors.front = oldColors.down;
            cubie.userData.faceColors.down = oldColors.back;
            cubie.userData.faceColors.back = oldColors.up;
        } else {
            cubie.userData.faceColors.up = oldColors.back;
            cubie.userData.faceColors.back = oldColors.down;
            cubie.userData.faceColors.down = oldColors.front;
            cubie.userData.faceColors.front = oldColors.up;
        }
    }
    if (axis === 'y') {
        if (clockwise) {
            cubie.userData.faceColors.front = oldColors.left;
            cubie.userData.faceColors.left = oldColors.back;
            cubie.userData.faceColors.back = oldColors.right;
            cubie.userData.faceColors.right = oldColors.front;
        } else {
            cubie.userData.faceColors.front = oldColors.right;
            cubie.userData.faceColors.right = oldColors.back;
            cubie.userData.faceColors.back = oldColors.left;
            cubie.userData.faceColors.left = oldColors.front;
        }
    }
    if (axis === 'z') {
        if (clockwise) {
            cubie.userData.faceColors.up = oldColors.left;
            cubie.userData.faceColors.left = oldColors.down;
            cubie.userData.faceColors.down = oldColors.right;
            cubie.userData.faceColors.right = oldColors.up;
        } else {
            cubie.userData.faceColors.up = oldColors.right;
            cubie.userData.faceColors.right = oldColors.down;
            cubie.userData.faceColors.down = oldColors.left;
            cubie.userData.faceColors.left = oldColors.up;
        }
    }
}
