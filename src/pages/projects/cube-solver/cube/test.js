import { materialHex } from "./cube";
import * as THREE from "three";

export const testState = {
	Top: [
		["W", "O", "R"],
		["W", "W", "Y"],
		["B", "B", "Y"],
	],
	Front: [
		["R", "W", "G"],
		["O", "O", "B"],
		["B", "B", "Y"],
	],
	Right: [
		["O", "G", "G"],
		["Y", "G", "O"],
		["B", "R", "O"],
	],
	Back: [
		["Y", "G", "G"],
		["W", "R", "O"],
		["W", "G", "O"],
	],
	Left: [
		["R", "R", "W"],
		["Y", "B", "B"],
		["B", "R", "R"],
	],
	Bottom: [
		["Y", "R", "O"],
		["Y", "Y", "G"],
		["W", "W", "G"],
	],
};

export function applyTestState(cubeGroupRef) {
    if (!cubeGroupRef?.current) {
        console.error("No cubeGroupRef.current found!");
        return;
    }

    const faceConfigs = {
        Top: { normal: new THREE.Vector3(0, 1, 0), u: 'x', v: 'z', flipU: false, flipV: true },
        Bottom: { normal: new THREE.Vector3(0, -1, 0), u: 'x', v: 'z', flipU: false, flipV: false },
        Left: { normal: new THREE.Vector3(-1, 0, 0), u: 'z', v: 'y', flipU: false, flipV: false },
        Right: { normal: new THREE.Vector3(1, 0, 0), u: 'z', v: 'y', flipU: true, flipV: false },
        Front: { normal: new THREE.Vector3(0, 0, 1), u: 'x', v: 'y', flipU: false, flipV: false },
        Back: { normal: new THREE.Vector3(0, 0, -1), u: 'x', v: 'y', flipU: true, flipV: false },
    };

    for (const faceKey in testState) {
        const { normal, u, v, flipU, flipV } = faceConfigs[faceKey];
        const stickers = findStickers(cubeGroupRef, normal);

        if (stickers.length !== 9) {
            console.warn(`[${faceKey}] Warning: Expected 9 stickers but found ${stickers.length}`);
            continue;
        }

        const side = testState[faceKey];

        for (const { mesh, faceIndex } of stickers) {
            const uPos = mesh.position[u];
            const vPos = mesh.position[v];

            let row = vPos > 0.5 ? 0 : vPos < -0.5 ? 2 : 1;
            let col = uPos > 0.5 ? 2 : uPos < -0.5 ? 0 : 1;

            if (flipU) col = 2 - col;
            if (flipV) row = 2 - row;

            const colorLetter = side[row][col];
            const colorHex = materialHex(colorLetter.toLowerCase());

            if (Array.isArray(mesh.material) && mesh.material[faceIndex]) {
                mesh.material[faceIndex].color.set(colorHex);
                mesh.material[faceIndex].needsUpdate = true;
            } else {
                console.error(`[${faceKey}] MISSING material for faceIndex ${faceIndex}`);
            }
        }
    }
}

function findStickers(cubeGroupRef, targetNormal) {
	const stickers = [];

	const surfaceThreshold = 0.1;
	for (const cubie of cubeGroupRef.current.children) {
		const pos = cubie.position;

		const isOnSurface =
			(targetNormal.x === 1 && Math.abs(pos.x - 1) <= surfaceThreshold) ||
			(targetNormal.x === -1 && Math.abs(pos.x + 1) <= surfaceThreshold) ||
			(targetNormal.y === 1 && Math.abs(pos.y - 1) <= surfaceThreshold) ||
			(targetNormal.y === -1 && Math.abs(pos.y + 1) <= surfaceThreshold) ||
			(targetNormal.z === 1 && Math.abs(pos.z - 1) <= surfaceThreshold) ||
			(targetNormal.z === -1 && Math.abs(pos.z + 1) <= surfaceThreshold);

		if (!isOnSurface) continue;

		for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
			const localNormal = normalForFaceIndex(faceIndex);
			const worldNormal = localNormal.clone().applyQuaternion(cubie.quaternion);

			const dot = worldNormal.dot(targetNormal);
			if (dot > 0.95) {
				if (Array.isArray(cubie.material) && cubie.material[faceIndex]) {
					stickers.push({ mesh: cubie, faceIndex });
				}
			}
		}
	}

	return stickers;
}

function normalForFaceIndex(index) {
	switch (index) {
		case 0: return new THREE.Vector3(1, 0, 0);  // right
		case 1: return new THREE.Vector3(-1, 0, 0); // left
		case 2: return new THREE.Vector3(0, 1, 0);  // top
		case 3: return new THREE.Vector3(0, -1, 0); // bottom
		case 4: return new THREE.Vector3(0, 0, 1);  // front
		case 5: return new THREE.Vector3(0, 0, -1); // back
		default: return new THREE.Vector3(0, 0, 0);
	}
}
