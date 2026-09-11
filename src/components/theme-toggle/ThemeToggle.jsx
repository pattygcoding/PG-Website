import React, { useEffect, useState } from "react";
import "./ThemeToggle.css";

const ThemeToggle = () => {
	const [theme, setTheme] = useState(() => localStorage.getItem("theme") === "light" ? "light" : "dark");
	const toggleTheme = () => {
		setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark");
	};

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
	}, [theme]);

	return (
		<button
			type="button"
			className="theme-switch"
			onClick={toggleTheme}
			aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
			aria-pressed={theme === "dark"}
		>
			<span className="theme-switch__sky" aria-hidden="true">
				<span className="theme-switch__star theme-switch__star--one" />
				<span className="theme-switch__star theme-switch__star--two" />
				<span className="theme-switch__star theme-switch__star--three" />
				<span className="theme-switch__cloud theme-switch__cloud--one" />
				<span className="theme-switch__cloud theme-switch__cloud--two" />
				<span className="theme-switch__thumb">
					<span className="theme-switch__crater theme-switch__crater--one" />
					<span className="theme-switch__crater theme-switch__crater--two" />
					<span className="theme-switch__crater theme-switch__crater--three" />
				</span>
			</span>
		</button>
	);
};

export default ThemeToggle;
