import { cubeState } from "./cube"; 

export function updateCubieMaterials(cubie) {
    const materials = cubie.material;
    const faceColors = cubie.userData.faceColors || {};

    if (!Array.isArray(materials)) return;

    if (faceColors.right !== undefined) {
        const idx = findStickerIndex(cubie, 'R');
        materials[0].color.set(materialHex(cubeState['R'][idx]));
    }

    if (faceColors.left !== undefined) {
        const idx = findStickerIndex(cubie, 'L');
        materials[1].color.set(materialHex(cubeState['L'][idx]));
    }

    if (faceColors.up !== undefined) {
        const idx = findStickerIndex(cubie, 'U');
        materials[2].color.set(materialHex(cubeState['U'][idx]));
    }
    
    if (faceColors.down !== undefined) {
        const idx = findStickerIndex(cubie, 'D');
        materials[3].color.set(materialHex(cubeState['D'][idx]));
    }

    if (faceColors.front !== undefined) {
        const idx = findStickerIndex(cubie, 'F');
        materials[4].color.set(materialHex(cubeState['F'][idx]));
    }

    if (faceColors.back !== undefined) {
        const idx = findStickerIndex(cubie, 'B');
        materials[5].color.set(materialHex(cubeState['B'][idx]));
    }
}

function findStickerIndex(cubie, face) {
    const x = Math.round(cubie.position.x);
    const y = Math.round(cubie.position.y);
    const z = Math.round(cubie.position.z);

    if (face === 'U') {
        return (z + 1) * 3 + (x + 1);
    }
    if (face === 'D') {
        return (2 - (z + 1)) * 3 + (x + 1);
    }
    if (face === 'F') {
        return (2 - (y + 1)) * 3 + (x + 1);
    }
    if (face === 'B') {
        return (2 - (y + 1)) * 3 + (2 - (x + 1));
    }
    if (face === 'R') {
        return (2 - (y + 1)) * 3 + (2 - (z + 1));
    }
    if (face === 'L') {
        return (2 - (y + 1)) * 3 + (z + 1);
    }

    return 0; 
}
