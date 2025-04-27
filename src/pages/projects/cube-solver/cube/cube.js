import * as THREE from "three";
import { mapping } from "./mapping";

export function materialHex(color) {
    const colorMap = {
        w: "#ffffff",
        white: "#ffffff",
        y: "#ffff00",
        yellow: "#ffff00",
        b: "#0000ff",
        blue: "#0000ff",
        g: "#00ff00",
        green: "#00ff00",
        o: "#ffa500",
        orange: "#ffa500",
        r: "#ff0000",
        red: "#ff0000",
    };
    return colorMap[color.toLowerCase()] || "#000000";
}

export const cubeState = {
    U: Array(9).fill('white'),
    D: Array(9).fill('yellow'),
    F: Array(9).fill('blue'),
    B: Array(9).fill('green'),
    L: Array(9).fill('orange'),
    R: Array(9).fill('red'),
};

export function createCubeGroup() {
    const group = new THREE.Group();
    const smallCubeSize = 0.98;
    const spacing = 1.01;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                let geometry = new THREE.BoxGeometry(smallCubeSize, smallCubeSize, smallCubeSize);
                geometry = geometry.toNonIndexed();

                const faceMaterials = [
                    new THREE.MeshBasicMaterial({ color: 0x000000 }),
                    new THREE.MeshBasicMaterial({ color: 0x000000 }),
                    new THREE.MeshBasicMaterial({ color: 0x000000 }),
                    new THREE.MeshBasicMaterial({ color: 0x000000 }),
                    new THREE.MeshBasicMaterial({ color: 0x000000 }),
                    new THREE.MeshBasicMaterial({ color: 0x000000 }),
                ];

                if (x === 1) faceMaterials[0].color.set(0xff0000);
                if (x === -1) faceMaterials[1].color.set(0xffa500);
                if (y === 1) faceMaterials[2].color.set(0xffffff);
                if (y === -1) faceMaterials[3].color.set(0xffff00);
                if (z === 1) faceMaterials[4].color.set(0x0000ff);
                if (z === -1) faceMaterials[5].color.set(0x00ff00);

                const smallCube = new THREE.Mesh(geometry, faceMaterials);
                smallCube.position.set(x * spacing, y * spacing, z * spacing);

                smallCube.userData.faceColors = {};
                if (x === 1) smallCube.userData.faceColors.right = "red";
                if (x === -1) smallCube.userData.faceColors.left = "orange";
                if (y === 1) smallCube.userData.faceColors.up = "white";
                if (y === -1) smallCube.userData.faceColors.down = "yellow";
                if (z === 1) smallCube.userData.faceColors.front = "blue";
                if (z === -1) smallCube.userData.faceColors.back = "green";

                group.add(smallCube);
            }
        }
    }

    return group;
}

export function updateCubeState(face, clockwise = true) {
    console.log(face, clockwise)
    const moves = mapping[face][clockwise ? 'clockwise' : 'counterClockwise'];
    console.log(moves)
    const newState = JSON.parse(JSON.stringify(cubeState));

    for (const [from, to] of moves) {
        newState[to.face][to.index] = cubeState[from.face][from.index];
    }

    Object.assign(cubeState, newState);
}

export function refreshCubeColors(cubies) {
    for (const cubie of cubies) {
        const faceColors = cubie.userData.faceColors || {};
        const materials = cubie.material;

        if (faceColors.right !== undefined) {
            materials[0].color.set(materialHex(faceColors.right));
        }
        if (faceColors.left !== undefined) {
            materials[1].color.set(materialHex(faceColors.left));
        }
        if (faceColors.up !== undefined) {
            materials[2].color.set(materialHex(faceColors.up));
        }
        if (faceColors.down !== undefined) {
            materials[3].color.set(materialHex(faceColors.down));
        }
        if (faceColors.front !== undefined) {
            materials[4].color.set(materialHex(faceColors.front));
        }
        if (faceColors.back !== undefined) {
            materials[5].color.set(materialHex(faceColors.back));
        }
    }
}
