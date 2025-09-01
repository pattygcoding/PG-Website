// Color mapping constants for the Rubik's cube
export const COLOR_HEX_MAP = {
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

export const HEX_TO_LETTER_MAP = {
    "FFFFFF": "W", // White
    "FFFF00": "Y", // Yellow
    "0000FF": "B", // Blue
    "FFA500": "O", // Orange
    "00FF00": "G", // Green
    "FF0000": "R", // Red
};

export const COLOR_OPTIONS = [
    { color: "white", hex: "#ffffff" },
    { color: "yellow", hex: "#ffff00" },
    { color: "blue", hex: "#0000ff" },
    { color: "orange", hex: "#ffa500" },
    { color: "green", hex: "#00ff00" },
    { color: "red", hex: "#ff0000" },
];

export const DEFAULT_CUBE_STATE = {
    U: Array(9).fill('white'),
    D: Array(9).fill('yellow'),
    F: Array(9).fill('blue'),
    B: Array(9).fill('green'),
    L: Array(9).fill('orange'),
    R: Array(9).fill('red'),
};
