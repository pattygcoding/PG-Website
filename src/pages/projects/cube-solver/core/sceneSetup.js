import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createCubeGroup } from "./cubeGeometry";
import { SCENE_CONFIG } from "../constants/config";

/**
 * Sets up the complete 3D scene for the cube solver
 * @param {React.RefObject} mountRef - Reference to the DOM mount point
 * @param {Object} sceneRefs - Object containing all scene references
 * @returns {Object} Cleanup function and additional utilities
 */
export function initializeCubeScene(mountRef, sceneRefs) {
    if (!mountRef.current) {
        console.error("Mount reference not available for scene initialization");
        return { cleanup: () => {} };
    }

    const scene = createScene(sceneRefs);
    const camera = createCamera(mountRef, sceneRefs);
    const renderer = createRenderer(mountRef, sceneRefs);
    const controls = createControls(camera, renderer, sceneRefs);
    const cubeGroup = createAndSetupCubeGroup(scene, sceneRefs);
    
    setupLighting(scene);
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const animationFrameId = startRenderLoop(renderer, scene, camera, controls);
    
    return {
        cleanup: () => cleanupScene(animationFrameId, mountRef, renderer),
        raycaster,
        mouse
    };
}

/**
 * Creates the main 3D scene
 * @param {Object} sceneRefs - Scene references object
 * @returns {THREE.Scene} The created scene
 */
function createScene(sceneRefs) {
    const scene = new THREE.Scene();
    sceneRefs.sceneRef.current = scene;
    return scene;
}

/**
 * Creates and configures the camera
 * @param {React.RefObject} mountRef - Mount reference
 * @param {Object} sceneRefs - Scene references object  
 * @returns {THREE.PerspectiveCamera} The created camera
 */
function createCamera(mountRef, sceneRefs) {
    const { clientWidth: width, clientHeight: height } = mountRef.current;
    const { CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR, CAMERA_POSITION_Z } = SCENE_CONFIG;
    
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, CAMERA_NEAR, CAMERA_FAR);
    camera.position.z = CAMERA_POSITION_Z;
    
    sceneRefs.cameraRef.current = camera;
    return camera;
}

/**
 * Creates and configures the WebGL renderer
 * @param {React.RefObject} mountRef - Mount reference
 * @param {Object} sceneRefs - Scene references object
 * @returns {THREE.WebGLRenderer} The created renderer
 */
function createRenderer(mountRef, sceneRefs) {
    const { clientWidth: width, clientHeight: height } = mountRef.current;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    
    mountRef.current.appendChild(renderer.domElement);
    sceneRefs.rendererRef.current = renderer;
    
    return renderer;
}

/**
 * Creates and configures orbit controls
 * @param {THREE.PerspectiveCamera} camera - The camera
 * @param {THREE.WebGLRenderer} renderer - The renderer
 * @param {Object} sceneRefs - Scene references object
 * @returns {OrbitControls} The created controls
 */
function createControls(camera, renderer, sceneRefs) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    sceneRefs.controlsRef.current = controls;
    return controls;
}

/**
 * Creates the cube group and adds it to the scene
 * @param {THREE.Scene} scene - The 3D scene
 * @param {Object} sceneRefs - Scene references object
 * @returns {THREE.Group} The created cube group
 */
function createAndSetupCubeGroup(scene, sceneRefs) {
    const cubeGroup = createCubeGroup();
    
    // Set initial cube orientation
    const { CUBE_INITIAL_ROTATION } = SCENE_CONFIG;
    cubeGroup.rotation.x = CUBE_INITIAL_ROTATION;
    cubeGroup.rotation.y = CUBE_INITIAL_ROTATION;
    
    scene.add(cubeGroup);
    sceneRefs.cubeGroupRef.current = cubeGroup;
    
    return cubeGroup;
}

/**
 * Sets up scene lighting
 * @param {THREE.Scene} scene - The 3D scene
 */
function setupLighting(scene) {
    const { 
        AMBIENT_LIGHT_INTENSITY, 
        DIRECTIONAL_LIGHT_INTENSITY, 
        DIRECTIONAL_LIGHT_POSITION 
    } = SCENE_CONFIG;
    
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY);
    scene.add(ambientLight);
    
    // Directional light for depth and shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, DIRECTIONAL_LIGHT_INTENSITY);
    directionalLight.position.set(...DIRECTIONAL_LIGHT_POSITION);
    scene.add(directionalLight);
}

/**
 * Starts the render animation loop
 * @param {THREE.WebGLRenderer} renderer - The renderer
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.PerspectiveCamera} camera - The camera
 * @param {OrbitControls} controls - The orbit controls
 * @returns {number} Animation frame ID for cleanup
 */
function startRenderLoop(renderer, scene, camera, controls) {
    function animate() {
        const frameId = requestAnimationFrame(animate);
        
        controls.update();
        renderer.render(scene, camera);
        
        return frameId;
    }
    
    return animate();
}

/**
 * Cleans up the scene and removes DOM elements
 * @param {number} animationFrameId - Animation frame ID to cancel
 * @param {React.RefObject} mountRef - Mount reference
 * @param {THREE.WebGLRenderer} renderer - The renderer to clean up
 */
function cleanupScene(animationFrameId, mountRef, renderer) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    if (mountRef.current && renderer?.domElement) {
        mountRef.current.removeChild(renderer.domElement);
    }
}
