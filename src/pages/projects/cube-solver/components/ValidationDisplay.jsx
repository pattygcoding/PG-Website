import React from "react";

/**
 * Validation results display component
 * @param {Object} props - Component properties
 * @param {Object} props.validationStatus - Validation status object
 * @param {boolean} props.validationStatus.isValid - Whether cube is valid
 * @param {string} props.validationStatus.message - Validation message
 * @param {string} props.validationStatus.className - CSS class name
 * @returns {JSX.Element} Validation display component
 */
export function ValidationDisplay({ validationStatus }) {
    if (!validationStatus) {
        return null;
    }

    const { isValid, message, className } = validationStatus;
    const style = { color: isValid ? "green" : "red" };

    return (
        <div className={`validation-results ${className || ''}`}>
            <span style={style}>
                {message}
            </span>
        </div>
    );
}
