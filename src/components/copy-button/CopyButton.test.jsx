import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import CopyButton from "./CopyButton";

test.each([true, false])("announces clipboard results (success: %s)", async (success) => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
	const writeText = jest.fn(() => success ? Promise.resolve() : Promise.reject(new Error("Denied")));
	Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		act(() => root.render(<CopyButton textToCopy="Sample output" />));
		expect(container.querySelector('[role="status"]').textContent).toBe("");
		await act(async () => container.querySelector("button").click());
		expect(writeText).toHaveBeenCalledWith("Sample output");
		expect(container.querySelector('[role="status"]').textContent).toBe(success ? "Copied to clipboard." : "Unable to copy. Select the text and copy it manually.");
		expect(Boolean(container.querySelector(".copied-tag"))).toBe(success);
	} finally {
		act(() => root.unmount());
		container.remove();
		if (originalClipboard) Object.defineProperty(navigator, "clipboard", originalClipboard);
		else delete navigator.clipboard;
	}
});