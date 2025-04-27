import * as THREE from "three";

export function materialHex(colorName) {
    const colorMap = {
        white: "#ffffff",
        yellow: "#ffff00",
        blue: "#0000ff",
        green: "#00ff00",
        orange: "#ffa500",
        red: "#ff0000",
    };
    return colorMap[colorName] || "#000000";
}

export function createCubeGroup() {
    const group = new THREE.Group();
    const smallCubeSize = 0.98;
    const spacing = 1.01;

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const geometry = new THREE.BoxGeometry(smallCubeSize, smallCubeSize, smallCubeSize);

                const faceMaterials = [
                    new THREE.MeshPhongMaterial({ color: x === 1 ? 0xff0000 : 0x000000 }), // Right
                    new THREE.MeshPhongMaterial({ color: x === -1 ? 0xffa500 : 0x000000 }), // Left
                    new THREE.MeshPhongMaterial({ color: y === 1 ? 0xffffff : 0x000000 }), // Top
                    new THREE.MeshPhongMaterial({ color: y === -1 ? 0xffff00 : 0x000000 }), // Bottom
                    new THREE.MeshPhongMaterial({ color: z === 1 ? 0x0000ff : 0x000000 }), // Front
                    new THREE.MeshPhongMaterial({ color: z === -1 ? 0x00ff00 : 0x000000 }), // Back
                ];

                const smallCube = new THREE.Mesh(geometry, faceMaterials);
                smallCube.position.set(x * spacing, y * spacing, z * spacing);
                group.add(smallCube);
            }
        }
    }

    return group;
}
