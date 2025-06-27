// rotations.js
import * as THREE from "three";
import { rotateFaceColorsForAxis } from "./faceRotationHelpers";
import { updateCubeState } from "./cube";

const ROTATION_SPEED = Math.PI / 60; // radians per frame

export function rotateLayer(cubeGroupRef, axis, value, totalAngle) {
  return new Promise(resolve => {
    const root = cubeGroupRef.current;
    if (!root) {
      resolve();
      return;
    }

    // ─── 1) FIND ALL CUBIES ON THIS SLICE ───────────────────────────────
    const layerCubies = [];
    root.traverse(obj => {
      // assume every cubie mesh has userData.faceColors
      if (obj.userData?.faceColors) {
        const pos = Math.round(obj.position[axis]);
        if (pos === value) layerCubies.push(obj);
      }
    });

    if (layerCubies.length === 0) {
      console.warn(`⚠️ No cubies found for ${axis} = ${value}`);
      resolve();
      return;
    }

    // ─── 2) compute center-of-mass for nice pivot ───────────────────────
    const center = new THREE.Vector3();
    layerCubies.forEach(c => center.add(c.position));
    center.divideScalar(layerCubies.length);

    // ─── 3) build rotation axis ────────────────────────────────────────
    const rotationAxis = new THREE.Vector3(
      axis === "x" ? 1 : 0,
      axis === "y" ? 1 : 0,
      axis === "z" ? 1 : 0
    );

    let rotated = 0;

    // ─── 4) animate loop ───────────────────────────────────────────────
    function animate() {
      const step = Math.sign(totalAngle)
        * Math.min(Math.abs(totalAngle - rotated), ROTATION_SPEED);

      // move each cubie’s position & orientation
      for (const cubie of layerCubies) {
        cubie.position.sub(center);
        cubie.position.applyAxisAngle(rotationAxis, step);
        cubie.position.add(center);
        cubie.rotateOnAxis(rotationAxis, step);
      }

      rotated += step;

      if (Math.abs(totalAngle - rotated) > 1e-3) {
        requestAnimationFrame(animate);
      } else {
        // ─── 5) final snap & recolor ──────────────────────────────────
        const clockwise = Math.sign(totalAngle) > 0;

        layerCubies.forEach(cubie => {
          // rotate stored face-colors
          rotateFaceColorsForAxis(cubie, axis, clockwise);
          remapCubieFaceColors(cubie, axis, clockwise);

          // snap position to integer grid
          cubie.position.x = Math.round(cubie.position.x);
          cubie.position.y = Math.round(cubie.position.y);
          cubie.position.z = Math.round(cubie.position.z);

          // snap rotation to nearest 90°
          cubie.rotation.x =
            Math.round(cubie.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
          cubie.rotation.y =
            Math.round(cubie.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
          cubie.rotation.z =
            Math.round(cubie.rotation.z / (Math.PI / 2)) * (Math.PI / 2);
        });

        // ─── 6) update your cube‐state and finish ──────────────────────
        const face = axisToFaceLetter(axis, value);
        if (face) updateCubeState(face, clockwise);

        setTimeout(resolve, 0);
      }
    }

    requestAnimationFrame(animate);
  });
}

function axisToFaceLetter(axis, value) {
  if (axis === "x") return value > 0 ? "R" : "L";
  if (axis === "y") return value > 0 ? "U" : "D";
  if (axis === "z") return value > 0 ? "F" : "B";
  return null;
}

function remapCubieFaceColors(cubie, axis, clockwise) {
  const old = { ...cubie.userData.faceColors };

  if (axis === "x") {
    if (clockwise) {
      cubie.userData.faceColors.up    = old.front;
      cubie.userData.faceColors.front = old.down;
      cubie.userData.faceColors.down  = old.back;
      cubie.userData.faceColors.back  = old.up;
    } else {
      cubie.userData.faceColors.up    = old.back;
      cubie.userData.faceColors.back  = old.down;
      cubie.userData.faceColors.down  = old.front;
      cubie.userData.faceColors.front = old.up;
    }
  }

  if (axis === "y") {
    if (clockwise) {
      cubie.userData.faceColors.front = old.left;
      cubie.userData.faceColors.left  = old.back;
      cubie.userData.faceColors.back  = old.right;
      cubie.userData.faceColors.right = old.front;
    } else {
      cubie.userData.faceColors.front = old.right;
      cubie.userData.faceColors.right = old.back;
      cubie.userData.faceColors.back  = old.left;
      cubie.userData.faceColors.left  = old.front;
    }
  }

  if (axis === "z") {
    if (clockwise) {
      cubie.userData.faceColors.up    = old.left;
      cubie.userData.faceColors.left  = old.down;
      cubie.userData.faceColors.down  = old.right;
      cubie.userData.faceColors.right = old.up;
    } else {
      cubie.userData.faceColors.up    = old.right;
      cubie.userData.faceColors.right = old.down;
      cubie.userData.faceColors.down  = old.left;
      cubie.userData.faceColors.left  = old.up;
    }
  }
}
