import React from "react";

/**
 * Solve button component for starting the cube solving algorithm
 * @param {Object} props - Component properties
 * @param {Function} props.onSolve - Callback when solve is clicked
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.text - Button text
 * @returns {JSX.Element} Solve button component
 */
export function SolveButton({ onSolve, disabled = false, text = "Start" }) {
    return (
        <button 
            className="solve-button" 
            onClick={onSolve}
            disabled={disabled}
            title={disabled ? "Fix cube validation errors first" : "Start solving algorithm"}
        >
            {text}
        </button>
    );
}
