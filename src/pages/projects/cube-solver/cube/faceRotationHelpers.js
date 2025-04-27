export function rotateFaceColorsForAxis(cubie, axis, direction) {
    const faceColors = cubie.userData.faceColors;
    if (!faceColors) return;

    const newFaceColors = {};

    if (axis === 'x') {
        if (direction > 0) {
            newFaceColors.up = faceColors.back;
            newFaceColors.back = faceColors.down;
            newFaceColors.down = faceColors.front;
            newFaceColors.front = faceColors.up;
            newFaceColors.left = faceColors.left;
            newFaceColors.right = faceColors.right;
        } else {
            newFaceColors.up = faceColors.front;
            newFaceColors.front = faceColors.down;
            newFaceColors.down = faceColors.back;
            newFaceColors.back = faceColors.up;
            newFaceColors.left = faceColors.left;
            newFaceColors.right = faceColors.right;
        }
    } else if (axis === 'y') {
        if (direction > 0) {
            newFaceColors.front = faceColors.left;
            newFaceColors.left = faceColors.back;
            newFaceColors.back = faceColors.right;
            newFaceColors.right = faceColors.front;
            newFaceColors.up = faceColors.up;
            newFaceColors.down = faceColors.down;
        } else {
            newFaceColors.front = faceColors.right;
            newFaceColors.right = faceColors.back;
            newFaceColors.back = faceColors.left;
            newFaceColors.left = faceColors.front;
            newFaceColors.up = faceColors.up;
            newFaceColors.down = faceColors.down;
        }
    } else if (axis === 'z') {
        if (direction > 0) {
            newFaceColors.up = faceColors.left;
            newFaceColors.left = faceColors.down;
            newFaceColors.down = faceColors.right;
            newFaceColors.right = faceColors.up;
            newFaceColors.front = faceColors.front;
            newFaceColors.back = faceColors.back;
        } else {
            newFaceColors.up = faceColors.right;
            newFaceColors.right = faceColors.down;
            newFaceColors.down = faceColors.left;
            newFaceColors.left = faceColors.up;
            newFaceColors.front = faceColors.front;
            newFaceColors.back = faceColors.back;
        }
    }

    cubie.userData.faceColors = newFaceColors;
}
