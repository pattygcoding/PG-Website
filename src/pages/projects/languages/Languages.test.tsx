import React, { act } from "react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/lang/languageContext";
import Languages from "./Languages";

// The world shapes are fetched at runtime and jsdom has no layout engine, so the
// map's environment is stubbed rather than the component itself: the render prop,
// the projection and the label predicate all still run for real.
const WORLD_TOPOJSON = readFileSync(path.join(process.cwd(), "public/assets/maps/countries-50m.json"), "utf8");

const stubMapEnvironment = (fetchImpl: () => Promise<unknown>) => {
	vi.stubGlobal("ResizeObserver", class {
		observe() {}
		unobserve() {}
		disconnect() {}
	});
	vi.stubGlobal("fetch", vi.fn(fetchImpl));
	vi.spyOn(console, "log").mockImplementation(() => {});
};

const renderMap = async (container: HTMLElement) => {
	const root = createRoot(container);
	await act(async () => root.render(
		<MemoryRouter initialEntries={["/languages"]}>
			<LanguageProvider>
				<Languages />
			</LanguageProvider>
		</MemoryRouter>
	));
	// Let the geographies promise settle before asserting on the map contents.
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
	return root;
};

let container: HTMLDivElement;

beforeEach(() => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	container = document.createElement("div");
	document.body.appendChild(container);
});

afterEach(() => {
	container.remove();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

test("labels the largest countries in the overview and leaves the smallest unlabelled", async () => {
	stubMapEnvironment(async () => ({ ok: true, json: async () => JSON.parse(WORLD_TOPOJSON) }));
	const root = await renderMap(container);
	try {
		const labels = Array.from(container.querySelectorAll(".map-country-label-text"));
		const texts = labels.map((node) => node.textContent);

		expect(texts).toContain("United States");
		expect(texts).toContain("Russia");
		expect(texts).toContain("Australia");
		// Countries far too small to hold a name at the overview zoom stay unlabelled.
		expect(texts).not.toContain("Luxembourg");
		expect(texts).not.toContain("Bhutan");
		expect(texts.length).toBeGreaterThanOrEqual(5);
		expect(texts.length).toBeLessThanOrEqual(30);

		// Names are decorative here: each country already carries a full aria-label.
		expect(labels[0].getAttribute("aria-hidden")).toBe("true");
		// One map unit covers one CSS pixel at this width, so 11px of text in map
		// units is what renders as 11 CSS pixels on screen.
		expect(labels[0].getAttribute("style")).toContain("font-size: 11");

		// Switching the names off really removes them from the map.
		await act(async () => container.querySelector<HTMLButtonElement>(".map-labels-toggle")!.click());
		expect(container.querySelectorAll(".map-country-label-text").length).toBe(0);
	} finally {
		act(() => root.unmount());
	}
});

test("the country-name toggle reflects and flips its state", async () => {
	stubMapEnvironment(() => Promise.reject(new Error("offline")));
	const root = await renderMap(container);
	try {
		const toggle = container.querySelector<HTMLButtonElement>(".map-labels-toggle");
		expect(toggle).not.toBeNull();
		expect(toggle!.getAttribute("aria-pressed")).toBe("true");
		expect(toggle!.getAttribute("aria-label")).toBe("Hide Country Names");

		await act(async () => toggle!.click());
		expect(toggle!.getAttribute("aria-pressed")).toBe("false");
		expect(toggle!.getAttribute("aria-label")).toBe("Show Country Names");
	} finally {
		act(() => root.unmount());
	}
});

