import { EXPECTED_CUBE_PIECES } from "../constants/config";

/**
 * Validates if the cube has all required pieces in correct colors
 * @param {React.RefObject} cubeGroupRef - Reference to the cube group
 * @returns {Array<string>} Array of missing piece descriptions
 */
export function validateCubeCompleteness(cubeGroupRef) {
    if (!cubeGroupRef.current) {
        return ["No cube found"];
    }

    const foundPieces = extractCubePieces(cubeGroupRef.current);
    const missingPieces = findMissingPieces(foundPieces);
    
    return missingPieces;
}

/**
 * Extracts all pieces from the current cube state
 * @param {THREE.Group} cubeGroup - The cube group containing all cubies
 * @returns {Set<string>} Set of found piece descriptions
 */
function extractCubePieces(cubeGroup) {
    const foundPieces = new Set();

    cubeGroup.children.forEach(cubie => {
        if (!Array.isArray(cubie.material)) return;

        const visibleFaces = extractVisibleFaceColors(cubie);
        const pieceDescription = createPieceDescription(visibleFaces);
        
        if (pieceDescription) {
            foundPieces.add(pieceDescription);
        }
    });

    return foundPieces;
}

/**
 * Extracts the visible (colored) faces from a cubie
 * @param {THREE.Mesh} cubie - The cubie mesh
 * @returns {Array<string>} Array of color letters for visible faces
 */
function extractVisibleFaceColors(cubie) {
    const faceColors = cubie.material.map(material => {
        const colorHex = material.color.getHexString().toUpperCase();
        return convertHexToColorLetter(colorHex);
    });

    return faceColors.filter(color => color !== "");
}

/**
 * Creates a normalized piece description from visible colors
 * @param {Array<string>} visibleColors - Array of visible color letters
 * @returns {string|null} Normalized piece description or null if invalid
 */
function createPieceDescription(visibleColors) {
    if (visibleColors.length === 0) return null;
    
    // Sort colors alphabetically for consistent comparison
    return visibleColors.sort().join("");
}

/**
 * Converts hex color to single letter representation
 * @param {string} hex - Hex color string (uppercase)
 * @returns {string} Single letter color code or empty string
 */
function convertHexToColorLetter(hex) {
    const colorMap = {
        "FFFFFF": "W", // White
        "FFFF00": "Y", // Yellow
        "0000FF": "B", // Blue
        "FFA500": "O", // Orange
        "00FF00": "G", // Green
        "FF0000": "R", // Red
    };
    
    return colorMap[hex] || "";
}

/**
 * Finds missing pieces by comparing found pieces with expected pieces
 * @param {Set<string>} foundPieces - Set of found piece descriptions
 * @returns {Array<string>} Array of missing piece descriptions
 */
function findMissingPieces(foundPieces) {
    const missingPieces = [];
    
    // Check corner pieces
    checkMissingPieceType(EXPECTED_CUBE_PIECES.CORNERS, foundPieces, missingPieces);
    
    // Check edge pieces  
    checkMissingPieceType(EXPECTED_CUBE_PIECES.EDGES, foundPieces, missingPieces);
    
    // Check center pieces
    checkMissingPieceType(EXPECTED_CUBE_PIECES.CENTERS, foundPieces, missingPieces);
    
    return missingPieces;
}

/**
 * Checks for missing pieces of a specific type
 * @param {Array<string>} expectedPieces - Array of expected pieces
 * @param {Set<string>} foundPieces - Set of found pieces
 * @param {Array<string>} missingPieces - Array to add missing pieces to
 */
function checkMissingPieceType(expectedPieces, foundPieces, missingPieces) {
    expectedPieces.forEach(expectedPiece => {
        const normalizedExpected = normalizeExpectedPiece(expectedPiece);
        
        if (!foundPieces.has(normalizedExpected)) {
            missingPieces.push(expectedPiece);
        }
    });
}

/**
 * Normalizes expected piece format to match found piece format
 * @param {string} expectedPiece - Expected piece description
 * @returns {string} Normalized piece description
 */
function normalizeExpectedPiece(expectedPiece) {
    return expectedPiece.split("").sort().join("");
}

/**
 * Gets a human-readable description of cube validation status
 * @param {Array<string>} missingPieces - Array of missing pieces
 * @returns {Object} Status object with isValid and message
 */
export function getCubeValidationStatus(missingPieces) {
    const isValid = missingPieces.length === 0;
    
    if (isValid) {
        return {
            isValid: true,
            message: "Cube is valid! ✅",
            className: "validation-success"
        };
    }
    
    return {
        isValid: false,
        message: `Cube is invalid. Missing pieces: ${missingPieces.join(", ")} ❌`,
        className: "validation-error"
    };
}
