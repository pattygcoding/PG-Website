import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Link } from "react-router-dom";
import AppRoutes from "./AppRoutes";

jest.mock("@/components/social-media", () => ({ SocialMedia: () => null }));
jest.mock("@/pages/home/Home", () => () => <main><h1>Home</h1></main>);
jest.mock("@/pages/about/About", () => () => <main><h1>About</h1></main>);

test("keeps initial focus and focuses content after navigation", async () => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		await act(async () => root.render(<MemoryRouter><Link to="/about">About</Link><AppRoutes /></MemoryRouter>));
		const content = container.querySelector("#main-content");
		expect(content.tabIndex).toBe(-1);
		expect(document.activeElement).not.toBe(content);
		jest.useFakeTimers();
		await act(async () => container.querySelector("a").click());
		act(() => jest.runOnlyPendingTimers());
		expect(document.activeElement).toBe(content);
		expect(content.querySelector("h1").textContent).toBe("About");
	} finally {
		act(() => root.unmount());
		container.remove();
		jest.useRealTimers();
	}
});