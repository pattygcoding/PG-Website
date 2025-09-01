import { useEffect } from "react";
import { initializeCubeScene } from "../core/sceneSetup";
import { getColorHex } from "../core/cubeGeometry";

/**
 * Custom hook for cube solver with painting functionality
 * @param {React.RefObject} mountRef - Reference to the DOM mount point
 * @param {Object} sceneRefs - Object containing all scene references  
 * @returns {void}
 */
export function useCubeSolverWithPainting(mountRef, sceneRefs) {
    const { selectedColorRef, mouseRef, raycasterRef } = sceneRefs;

    useEffect(() => {
        if (!mountRef.current) return;

        const { cleanup, raycaster, mouse } = initializeCubeScene(mountRef, sceneRefs);

        // Store mouse and raycaster references
        mouseRef.current = mouse;
        raycasterRef.current = raycaster;

        // Set up painting functionality
        const paintingHandlers = setupPaintingInteraction(
            mountRef, 
            sceneRefs, 
            handleCubePainting
        );

        return () => {
            cleanup();
            cleanupPaintingHandlers(mountRef, paintingHandlers);
        };
    }, [
        mountRef,
        sceneRefs.sceneRef,
        sceneRefs.cubeGroupRef,
        sceneRefs.rendererRef,
        sceneRefs.cameraRef,
        sceneRefs.controlsRef,
        selectedColorRef,
        mouseRef,
        raycasterRef,
    ]);

    /**
     * Handles cube painting when user clicks on a face
     * @param {MouseEvent} event - Mouse click event
     */
    function handleCubePainting(event) {
        if (!isValidForPainting(mountRef, sceneRefs)) return;

        const intersection = getIntersectionData(event, mountRef, sceneRefs);
        if (!intersection) return;

        applyPaintToFace(intersection, selectedColorRef.current);
    }
}

/**
 * Sets up mouse interaction handlers for painting functionality
 * @param {React.RefObject} mountRef - Mount reference
 * @param {Object} sceneRefs - Scene references
 * @param {Function} paintHandler - Function to handle painting
 * @returns {Object} Object containing event handlers for cleanup
 */
function setupPaintingInteraction(mountRef, sceneRefs, paintHandler) {
    let mouseDownState = {
        time: 0,
        position: { x: 0, y: 0 }
    };

    function onMouseDown(event) {
        mouseDownState.time = Date.now();
        mouseDownState.position = { x: event.clientX, y: event.clientY };
    }

    function onMouseUp(event) {
        if (isQuickClick(event, mouseDownState)) {
            paintHandler(event);
        }
    }

    // Add event listeners
    mountRef.current.addEventListener('mousedown', onMouseDown);
    mountRef.current.addEventListener('mouseup', onMouseUp);

    return { onMouseDown, onMouseUp };
}

/**
 * Determines if mouse interaction was a quick click (not a drag)
 * @param {MouseEvent} event - Mouse up event
 * @param {Object} mouseDownState - State from mouse down
 * @returns {boolean} True if it was a quick click
 */
function isQuickClick(event, mouseDownState) {
    const currentTime = Date.now();
    const timeDelta = currentTime - mouseDownState.time;
    
    const moveDelta = Math.sqrt(
        Math.pow(event.clientX - mouseDownState.position.x, 2) +
        Math.pow(event.clientY - mouseDownState.position.y, 2)
    );

    return timeDelta < 200 && moveDelta < 5;
}

/**
 * Validates that all required references are available for painting
 * @param {React.RefObject} mountRef - Mount reference
 * @param {Object} sceneRefs - Scene references
 * @returns {boolean} True if valid for painting
 */
function isValidForPainting(mountRef, sceneRefs) {
    return !!(
        mountRef.current &&
        sceneRefs.cubeGroupRef.current &&
        sceneRefs.mouseRef.current &&
        sceneRefs.raycasterRef.current &&
        sceneRefs.cameraRef.current
    );
}

/**
 * Gets intersection data from mouse click
 * @param {MouseEvent} event - Mouse click event
 * @param {React.RefObject} mountRef - Mount reference
 * @param {Object} sceneRefs - Scene references
 * @returns {Object|null} Intersection data or null
 */
function getIntersectionData(event, mountRef, sceneRefs) {
    const mouse = sceneRefs.mouseRef.current;
    const raycaster = sceneRefs.raycasterRef.current;
    const camera = sceneRefs.cameraRef.current;
    const cubeGroup = sceneRefs.cubeGroupRef.current;

    // Convert mouse position to normalized device coordinates
    const bounds = mountRef.current.getBoundingClientRect();
    mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

    // Update raycaster
    raycaster.setFromCamera(mouse, camera);

    // Find intersections
    const intersects = raycaster.intersectObjects(cubeGroup.children, true);
    
    if (intersects.length === 0) return null;

    const intersect = intersects[0];
    return {
        mesh: intersect.object,
        faceIndex: Math.floor(intersect.faceIndex / 2)
    };
}

/**
 * Applies paint color to the intersected face
 * @param {Object} intersection - Intersection data
 * @param {string} selectedColor - Selected color name
 */
function applyPaintToFace(intersection, selectedColor) {
    const { mesh, faceIndex } = intersection;
    
    if (!selectedColor || !mesh || !Array.isArray(mesh.material)) {
        return;
    }

    const material = mesh.material[faceIndex];
    if (!material) return;

    // Only paint faces that are not black (visible faces)
    const currentColor = material.color.getHexString();
    if (currentColor === "000000") return;

    // Apply new color
    const newColorHex = getColorHex(selectedColor);
    material.color.set(newColorHex);
    material.needsUpdate = true;
}

/**
 * Cleans up painting event handlers
 * @param {React.RefObject} mountRef - Mount reference
 * @param {Object} handlers - Handler functions to remove
 */
function cleanupPaintingHandlers(mountRef, handlers) {
    if (mountRef.current) {
        mountRef.current.removeEventListener('mousedown', handlers.onMouseDown);
        mountRef.current.removeEventListener('mouseup', handlers.onMouseUp);
    }
}
