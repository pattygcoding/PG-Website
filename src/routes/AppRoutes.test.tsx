import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Link } from "react-router-dom";
import AppRoutes from "./AppRoutes";

vi.mock("@/components/social-media", () => ({ SocialMedia: () => null }));
vi.mock("@/pages/home/Home", () => ({ default: () => <main><h1>Home</h1></main> }));
vi.mock("@/pages/about/About", () => ({ default: () => <main><h1>About</h1></main> }));

test("keeps initial focus and focuses content after navigation", async () => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		await act(async () => root.render(<MemoryRouter><Link to="/about">About</Link><AppRoutes /></MemoryRouter>));
		const content = container.querySelector<HTMLElement>("#main-content")!;
		expect(content.tabIndex).toBe(-1);
		expect(document.activeElement).not.toBe(content);
		vi.useFakeTimers();
		await act(async () => container.querySelector<HTMLElement>("a")!.click());
		act(() => vi.runOnlyPendingTimers());
		expect(document.activeElement).toBe(content);
		expect(content.querySelector("h1")!.textContent).toBe("About");
	} finally {
		act(() => root.unmount());
		container.remove();
		vi.useRealTimers();
	}
});

test("sends retired arcade routes to the arcade subdomain instead of the home page", async () => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	// jsdom refuses cross-origin navigation, so silence its not-implemented error.
	const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		await act(async () => root.render(<MemoryRouter initialEntries={["/snake"]}><AppRoutes /></MemoryRouter>));
		expect(container.querySelector('a[href="https://arcade.pattygcoding.com/snake"]')).not.toBeNull();
		expect(container.querySelector("h1")).toBeNull();
	} finally {
		act(() => root.unmount());
		container.remove();
		consoleError.mockRestore();
	}
});