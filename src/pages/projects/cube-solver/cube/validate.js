export function validateCube(cubeGroupRef) {
    if (!cubeGroupRef.current) return [];

    const expectedCorners = ["WRB", "WBO", "WRG", "WOG", "YRB", "YBO", "YRG", "YOG"];
    const expectedSides = ["WB", "WR", "WG", "WO", "YB", "YR", "YG", "YO", "RB", "BO", "RG", "GO"];
    const expectedCenters = ["W", "Y", "B", "G", "R", "O"];

    const foundPieces = new Set();

    cubeGroupRef.current.children.forEach(cube => {
        if (!Array.isArray(cube.material)) return;

        const faceColors = cube.material.map(mat => {
            const colorHex = mat.color.getHexString().toUpperCase();
            return hexToLetter(colorHex);
        });

        const nonBlackFaces = faceColors.filter(c => c !== "");

        if (nonBlackFaces.length === 1) {
            foundPieces.add(nonBlackFaces[0]);
        }
        if (nonBlackFaces.length === 2) {
            const sortedEdge = nonBlackFaces.sort().join("");
            foundPieces.add(sortedEdge);
        }
        if (nonBlackFaces.length === 3) {
            const sortedCorner = nonBlackFaces.sort().join("");
            foundPieces.add(sortedCorner);
        }
    });

    const missingPieces = [];

    expectedCorners.forEach(piece => {
        const sortedPiece = piece.split("").sort().join("");
        if (!foundPieces.has(sortedPiece)) {
            missingPieces.push(piece);
        }
    });

    expectedSides.forEach(piece => {
        const sortedPiece = piece.split("").sort().join("");
        if (!foundPieces.has(sortedPiece)) {
            missingPieces.push(piece);
        }
    });

    expectedCenters.forEach(piece => {
        if (!foundPieces.has(piece)) {
            missingPieces.push(piece);
        }
    });

    return missingPieces;
}

function hexToLetter(hex) {
    switch (hex) {
        case "FFFFFF": return "W"; // White
        case "FFFF00": return "Y"; // Yellow
        case "0000FF": return "B"; // Blue
        case "FFA500": return "O"; // Orange
        case "00FF00": return "G"; // Green
        case "FF0000": return "R"; // Red
        default: return "";
    }
}
