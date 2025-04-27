import * as THREE from "three";

const ROTATION_SPEED = Math.PI / 60;

export function W90CC(cubeGroupRef) {
	rotateCenterFace(cubeGroupRef, "ffffff", -Math.PI / 2);
}

export function W90C(cubeGroupRef) {
	rotateCenterFace(cubeGroupRef, "ffffff", Math.PI / 2);
}

export function R90CC(cubeGroupRef) {
	rotateCenterFace(cubeGroupRef, "ff0000", -Math.PI / 2);
}

export function R90C(cubeGroupRef) {
	rotateCenterFace(cubeGroupRef, "ff0000", Math.PI / 2);
}

export function B90CC(cubeGroupRef) {
	rotateCenterFace(cubeGroupRef, "0000ff", -Math.PI / 2);
}

export function B90C(cubeGroupRef) {
	rotateCenterFace(cubeGroupRef, "0000ff", Math.PI / 2);
}

export function O90CC(cubeGroupRef) {
	rotateCenterFace(cubeGroupRef, "ffa500", -Math.PI / 2);
}

export function O90C(cubeGroupRef) {
	rotateCenterFace(cubeGroupRef, "ffa500", Math.PI / 2);
}

export function G90CC(cubeGroupRef) {
	rotateCenterFace(cubeGroupRef, "00ff00", -Math.PI / 2);
}

export function G90C(cubeGroupRef) {
	rotateCenterFace(cubeGroupRef, "00ff00", Math.PI / 2);
}

export function Y90CC(cubeGroupRef) {
	rotateCenterFace(cubeGroupRef, "ffff00", -Math.PI / 2);
}

export function Y90C(cubeGroupRef) {
	rotateCenterFace(cubeGroupRef, "ffff00", Math.PI / 2);
}

function rotateCenterFace(cubeGroupRef, colorHex, totalAngle) {
	if (!cubeGroupRef?.current) return;

	const centerCubies = findCenterCubies(cubeGroupRef);

	for (const cubie of centerCubies) {
		const materials = cubie.material;
		if (!Array.isArray(materials)) continue;

		for (let face = 0; face < materials.length; face++) {
			const material = materials[face];
			if (!material) continue;

			const color = material.color.getHexString();
			if (color === colorHex) {
				const { x, y, z } = cubie.position;

				if (Math.abs(x) > 0.5) {
					rotateLayerAnimated(cubeGroupRef, 'x', x, totalAngle);
				} else if (Math.abs(y) > 0.5) {
					rotateLayerAnimated(cubeGroupRef, 'y', y, totalAngle);
				} else if (Math.abs(z) > 0.5) {
					rotateLayerAnimated(cubeGroupRef, 'z', z, totalAngle);
				}
				return;
			}
		}
	}
}

function findCenterCubies(cubeGroupRef) {
	return cubeGroupRef.current.children.filter(cubie => {
		const { x, y, z } = cubie.position;
		const values = [Math.abs(x), Math.abs(y), Math.abs(z)];
		return values.filter(v => v < 0.5).length === 2;
	});
}

function rotateLayerAnimated(cubeGroupRef, axis, value, totalAngle) {
	const layerCubies = cubeGroupRef.current.children.filter(cubie => {
		const pos = cubie.position[axis];
		return Math.abs(pos - value) < 0.2;
	});

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

		if (Math.abs(rotated) < Math.abs(totalAngle)) {
			requestAnimationFrame(animate);
		}
	}

	animate();
}
