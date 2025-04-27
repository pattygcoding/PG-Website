import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createCubeGroup } from "./cube";

export function setupCubeSolver(mountRef, refs) {
    const scene = new THREE.Scene();
    refs.sceneRef.current = scene;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 6;
    refs.cameraRef.current = camera;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    refs.rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    refs.controlsRef.current = controls;

    const cubeGroup = createCubeGroup();
    refs.cubeGroupRef.current = cubeGroup;
    scene.add(cubeGroup);

    cubeGroup.rotation.x = Math.PI / 4;
    cubeGroup.rotation.y = Math.PI / 4;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let animationFrameId;

    function animate() {
        animationFrameId = requestAnimationFrame(animate);

        if (refs.controlsRef?.current) {
            refs.controlsRef.current.update();
        }

        if (refs.rendererRef?.current && refs.sceneRef?.current && refs.cameraRef?.current) {
            refs.rendererRef.current.render(refs.sceneRef.current, refs.cameraRef.current);
        }
    }

    animate();

    function cleanup() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        if (mountRef.current && refs.rendererRef.current?.domElement) {
            mountRef.current.removeChild(refs.rendererRef.current.domElement);
        }
    }

    return {
        cleanup,
        raycaster,
        mouse
    };
}
