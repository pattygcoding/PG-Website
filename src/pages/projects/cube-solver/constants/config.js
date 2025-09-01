// Rotation configuration constants
export const ROTATION_AXIS_MAP = {
    U: { axis: 'y', value: 1 },
    D: { axis: 'y', value: -1 },
    F: { axis: 'z', value: 1 },
    B: { axis: 'z', value: -1 },
    R: { axis: 'x', value: 1 },
    L: { axis: 'x', value: -1 },
};

export const ANIMATION_CONFIG = {
    ROTATION_SPEED: Math.PI / 60, // radians per frame
    SURFACE_THRESHOLD: 0.1,
    SMALL_CUBE_SIZE: 0.98,
    CUBE_SPACING: 1.01,
};

export const SCENE_CONFIG = {
    CAMERA_FOV: 75,
    CAMERA_NEAR: 0.1,
    CAMERA_FAR: 1000,
    CAMERA_POSITION_Z: 6,
    AMBIENT_LIGHT_INTENSITY: 0.8,
    DIRECTIONAL_LIGHT_INTENSITY: 0.6,
    DIRECTIONAL_LIGHT_POSITION: [5, 10, 7.5],
    CUBE_INITIAL_ROTATION: Math.PI / 4,
};

export const EXPECTED_CUBE_PIECES = {
    CORNERS: ["WRB", "WBO", "WRG", "WOG", "YRB", "YBO", "YRG", "YOG"],
    EDGES: ["WB", "WR", "WG", "WO", "YB", "YR", "YG", "YO", "RB", "BO", "RG", "GO"],
    CENTERS: ["W", "Y", "B", "G", "R", "O"],
};
