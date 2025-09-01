import React from "react";
import { COLOR_OPTIONS } from "../constants/colors";

/**
 * Color picker component for selecting cube face colors
 * @param {Object} props - Component properties
 * @param {string} props.selectedColor - Currently selected color
 * @param {Function} props.onColorSelect - Callback when color is selected
 * @returns {JSX.Element} Color picker component
 */
export function ColorPicker({ selectedColor, onColorSelect }) {
    return (
        <div className="color-picker">
            {COLOR_OPTIONS.map((colorOption) => (
                <ColorCircle
                    key={colorOption.color}
                    color={colorOption.color}
                    hex={colorOption.hex}
                    isSelected={selectedColor === colorOption.color}
                    onClick={() => onColorSelect(colorOption.color)}
                />
            ))}
        </div>
    );
}

/**
 * Individual color circle component
 * @param {Object} props - Component properties
 * @param {string} props.color - Color name
 * @param {string} props.hex - Hex color value
 * @param {boolean} props.isSelected - Whether this color is selected
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element} Color circle component
 */
function ColorCircle({ color, hex, isSelected, onClick }) {
    const className = `color-circle ${isSelected ? 'selected' : ''}`;
    
    return (
        <div
            className={className}
            style={{ backgroundColor: hex }}
            onClick={onClick}
            title={`Select ${color}`}
        >
            {isSelected && <span className="checkmark">✔</span>}
        </div>
    );
}
