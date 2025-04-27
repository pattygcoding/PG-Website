import { useEffect } from "react";
import { setupCubeSolver } from "./setup";
import { materialHex } from "./cube";

export function useCubeSolver(mountRef, {
	sceneRef,
	cubeGroupRef,
	rendererRef,
	cameraRef,
	controlsRef,
	selectedColorRef,
	mouseRef,
	raycasterRef,
}) {
	useEffect(() => {
		if (!mountRef.current) return;

		const { cleanup, raycaster, mouse } = setupCubeSolver(mountRef, {
			sceneRef,
			cubeGroupRef,
			rendererRef,
			cameraRef,
			controlsRef,
			selectedColorRef,
		});

		mouseRef.current = mouse;
		raycasterRef.current = raycaster;

		let mouseDownTime = 0;
		let mouseDownPos = { x: 0, y: 0 };

		function onMouseDown(event) {
			mouseDownTime = Date.now();
			mouseDownPos = { x: event.clientX, y: event.clientY };
		}

		function onMouseUp(event) {
			const mouseUpTime = Date.now();
			const timeHeld = mouseUpTime - mouseDownTime;
			const moveDistance = Math.sqrt(
				Math.pow(event.clientX - mouseDownPos.x, 2) +
				Math.pow(event.clientY - mouseDownPos.y, 2)
			);

			if (timeHeld < 200 && moveDistance < 5) {
				paintCube(event);
			}
		}

		function paintCube(event) {
			if (!mountRef.current || !cubeGroupRef.current || !mouseRef.current || !raycasterRef.current) return;

			const bounds = mountRef.current.getBoundingClientRect();
			mouseRef.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
			mouseRef.current.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

			raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

			const intersects = raycasterRef.current.intersectObjects(cubeGroupRef.current.children, true);

			if (intersects.length > 0) {
				const intersect = intersects[0];
				const mesh = intersect.object;
				const faceIndex = Math.floor(intersect.faceIndex / 2);

				if (!selectedColorRef.current) return;
				if (!mesh || !Array.isArray(mesh.material)) return;

				const hex = materialHex(selectedColorRef.current);

				if (mesh.material[faceIndex]) {
					const currentColor = mesh.material[faceIndex].color.getHexString();
					if (currentColor !== "000000") {
						mesh.material[faceIndex].color.set(hex);
						mesh.material[faceIndex].needsUpdate = true;
					}
				}
			}
		}

		mountRef.current.addEventListener('mousedown', onMouseDown);
		mountRef.current.addEventListener('mouseup', onMouseUp);

		return () => {
			cleanup();
			if (mountRef.current) {
				mountRef.current.removeEventListener('mousedown', onMouseDown);
				mountRef.current.removeEventListener('mouseup', onMouseUp);
			}
		};
	}, [
		mountRef,
		sceneRef,
		cubeGroupRef,
		rendererRef,
		cameraRef,
		controlsRef,
		selectedColorRef,
		mouseRef,
		raycasterRef,
	]);
}
