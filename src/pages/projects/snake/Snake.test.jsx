import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import Snake from "./Snake";

jest.mock("@/lang/languageContext", () => ({ useLang: () => ({ t: (key) => key }) }));
jest.mock("@/components/tab", () => ({ Tab: () => null }));

test("keyboard-activated direction buttons send input without moving focus", () => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		act(() => root.render(<Snake />));
		const canvas = container.querySelector("canvas");
		const button = container.querySelector('[aria-label="Move up"]');
		const events = [];
		canvas.addEventListener("keydown", (event) => events.push([event.type, event.key]));
		canvas.addEventListener("keyup", (event) => events.push([event.type, event.key]));
		button.focus();
		act(() => button.click());
		expect(events).toEqual([["keydown", "ArrowUp"], ["keyup", "ArrowUp"]]);
		expect(document.activeElement).toBe(button);
		expect(container.querySelector('[role="status"]')).not.toBeNull();
	} finally {
		act(() => root.unmount());
		container.remove();
	}
});