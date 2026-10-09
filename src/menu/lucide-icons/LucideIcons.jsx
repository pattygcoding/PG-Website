import React from "react";

// Lucide (ISC licensed) icon shapes, inlined so a game shows the same glyph in
// this menu as it does on the Arcade site (Repos/Arcade-PG-Website). The
// react-icons build this project pins ships no Lucide set, so the few shapes we
// need are kept here. Sizing matches react-icons: 1em, so the consumer's
// font-size drives it.
const LucideIcon = ({ children, ...props }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		{children}
	</svg>
);

export const FlaskConical = (props) => (
	<LucideIcon {...props}>
		<path d="M10 2v7.31" />
		<path d="M14 9.3V1.99" />
		<path d="M8.5 2h7" />
		<path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
		<path d="M5.52 16h12.96" />
	</LucideIcon>
);

export const Pickaxe = (props) => (
	<LucideIcon {...props}>
		<path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0a2.12 2.12 0 0 1 0-3L11 10" />
		<path d="m16 16 6-6" />
		<path d="m8 8 6-6" />
		<path d="m9 7 8 8" />
		<path d="m21 11-8-8" />
	</LucideIcon>
);

export const Gamepad2 = (props) => (
	<LucideIcon {...props}>
		<line x1="6" x2="10" y1="11" y2="11" />
		<line x1="8" x2="8" y1="9" y2="13" />
		<line x1="15" x2="15.01" y1="12" y2="12" />
		<line x1="18" x2="18.01" y1="10" y2="10" />
		<path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
	</LucideIcon>
);

export const Blocks = (props) => (
	<LucideIcon {...props}>
		<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
		<path d="m3.3 7 8.7 5 8.7-5" />
		<path d="M12 22V12" />
	</LucideIcon>
);
