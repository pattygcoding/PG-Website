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
const SUBDIVISIONS_TOPOJSON = readFileSync(path.join(process.cwd(), "public/assets/maps/subdivisions-50m.json"), "utf8");
const SUBDIVISION_BORDERS_GEOJSON = readFileSync(path.join(process.cwd(), "public/assets/maps/subdivision-borders-50m.json"), "utf8");

/**
 * Serves each layer the file it actually asks for. The subdivision layer only mounts past
 * 3x zoom, so any test that zooms has to hand it the real outlines and dotted borders.
 */
const serveMapData = (url: string) =>
	Promise.resolve({
		ok: true,
		json: async () => JSON.parse(
			url.includes("subdivision-borders")
				? SUBDIVISION_BORDERS_GEOJSON
				: url.includes("subdivisions")
					? SUBDIVISIONS_TOPOJSON
					: WORLD_TOPOJSON
		)
	});

/** The map URLs that were actually requested, so the lazy layers can be asserted on. */
let requested: string[] = [];

const stubMapEnvironment = (fetchImpl: (url: string) => Promise<unknown>) => {
	requested = [];
	vi.stubGlobal("ResizeObserver", class {
		observe() {}
		unobserve() {}
		disconnect() {}
	});
	vi.stubGlobal("fetch", vi.fn((url: string) => {
		requested.push(url);
		return fetchImpl(url);
	}));
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
	stubMapEnvironment(serveMapData);
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

		// The subdivision layer only mounts once the map is zoomed in, so a visitor who
		// never zooms never downloads the outlines (nor sees the state shapes).
		expect(requested.some((url) => url.includes("countries-50m.json"))).toBe(true);
		expect(requested.some((url) => url.includes("subdivisions-50m.json"))).toBe(false);
		expect(requested.some((url) => url.includes("subdivision-borders-50m.json"))).toBe(false);
		expect(container.querySelector("[data-map-subdivision]")).toBeNull();
		expect(container.querySelector("[data-map-borders]")).toBeNull();
	} finally {
		act(() => root.unmount());
	}
});

test("a wheel notch zooms by a constant fraction however far in you are", async () => {
	stubMapEnvironment(serveMapData);
	const root = await renderMap(container);
	try {
		const content = container.querySelector<HTMLElement>(".react-transform-component")!;
		const scaleNow = () => Number(/scale\(([\d.]+)\)/.exec(content.style.transform)?.[1] ?? 1);
		const notch = async () => {
			await act(async () => {
				content.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true }));
			});
		};

		expect(scaleNow()).toBeCloseTo(1);

		// Each notch adds the same 30% of the *current* zoom: 1 -> 1.3 -> 1.69. The
		// library's own fixed step would have managed 1 -> 1.1 -> 1.2, which is the
		// "zoom gets slower the further in you go" this replaces.
		await notch();
		expect(scaleNow()).toBeCloseTo(1.3, 2);
		await notch();
		expect(scaleNow()).toBeCloseTo(1.69, 2);
	} finally {
		act(() => root.unmount());
	}
});

test("the opening view is the furthest you can zoom out", async () => {
	stubMapEnvironment(serveMapData);
	const root = await renderMap(container);
	try {
		const content = container.querySelector<HTMLElement>(".react-transform-component")!;
		const scaleNow = () => Number(/scale\(([\d.]+)\)/.exec(content.style.transform)?.[1] ?? 1);
		const wheel = async (deltaY: number) => {
			await act(async () => {
				content.dispatchEvent(new WheelEvent("wheel", { deltaY, bubbles: true, cancelable: true }));
			});
		};

		// Zooming out of the first render leaves the map exactly as it was. The library's
		// zoom padding would otherwise drop below 1x and spring back, and minScale alone
		// only limits that to the padding (0.4) rather than to the opening view.
		await wheel(100);
		expect(scaleNow()).toBe(1);
		await wheel(100);
		expect(scaleNow()).toBe(1);

		// Zoom in, then out again: it stops dead at the opening view too.
		await wheel(-100);
		await wheel(-100);
		expect(scaleNow()).toBeCloseTo(1.69, 2);
		for (let notch = 0; notch < 6; notch += 1) await wheel(100);
		expect(scaleNow()).toBe(1);
	} finally {
		act(() => root.unmount());
	}
});

test("subdivision borders are dotted, and their dots keep their size as you zoom", async () => {
	stubMapEnvironment(serveMapData);
	const root = await renderMap(container);
	try {
		const content = container.querySelector<HTMLElement>(".react-transform-component")!;
		const zoomIn = async () => {
			await act(async () => {
				content.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true }));
			});
		};
		const border = () => container.querySelector<SVGPathElement>("[data-map-borders]");
		const dashes = () => (border()!.getAttribute("stroke-dasharray") ?? "").split(/\s+/).map(Number);
		const scaleNow = () => Number(/scale\(([\d.]+)\)/.exec(content.style.transform)?.[1] ?? 1);

		// The subdivision layer is lazy, so zoom past its 3x threshold first.
		for (let notch = 0; notch < 8 && !border(); notch += 1) await zoomIn();
		expect(border()).not.toBeNull();

		// The states and provinces themselves are hit areas only, and left unpainted: they
		// would be filled the country's own colour anyway, and that covered the half of
		// every country boundary stroke lying inside them. Dotted borders on the shapes
		// also ran along the edges they share with another country — the USA and Canada
		// agree on the boundary between them — which is what dotted the solid US-Canada
		// border. (jsdom does not apply the stylesheet, so the `pointer-events: all` that
		// keeps these unpainted shapes hit-testable is not asserted here.)
		const state = container.querySelector("[data-map-subdivision]")!;
		expect(state.getAttribute("stroke")).toBe("none");
		expect(state.getAttribute("fill")).toBe("none");

		// Dotted rather than solid: a dot, a longer gap, and rounded ends.
		const [dot, gap] = dashes();
		expect(dot).toBeGreaterThan(0);
		expect(gap).toBeGreaterThan(0);
		expect(border()!.getAttribute("stroke-linecap")).toBe("round");
		// The borders come from their own lazy layer, so a path with real geometry here
		// also means that layer was fetched and projected.
		expect(border()!.getAttribute("d")).toMatch(/^M[-\d.]+,[-\d.]+L/);
		// Opted out of the map's non-scaling stroke, which only normalises stroke width
		// and would otherwise let the zoom stretch the dots.
		expect(border()!.getAttribute("style")).toMatch(/vector-effect:\s*none/);

		// Dot sizes are stored in map units that shrink as the map grows, so a dot covers
		// the same number of screen pixels at any zoom.
		const before = dashes()[0] * scaleNow();
		await zoomIn();
		const ratio = (dashes()[0] * scaleNow()) / before;
		expect(ratio).toBeGreaterThan(0.9);
		expect(ratio).toBeLessThan(1.1);
	} finally {
		act(() => root.unmount());
	}
});

test("the tooltip shows a subdivision's own flag where the flag set has one", async () => {
	stubMapEnvironment(serveMapData);
	const root = await renderMap(container);
	try {
		const content = container.querySelector<HTMLElement>(".react-transform-component")!;
		const shape = (id: string) => container.querySelector<SVGPathElement>(`[data-map-subdivision="${id}"]`);
		const hover = async (id: string) => {
			await act(async () => {
				shape(id)!.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
			});
		};
		const flagSrc = () => container.querySelector(".tooltip-flag img")?.getAttribute("src") ?? "";

		// The subdivision layer is lazy, so zoom past its 3x threshold first.
		for (let notch = 0; notch < 8 && !shape("GB-WLS"); notch += 1) {
			await act(async () => {
				content.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true }));
			});
		}
		expect(shape("GB-WLS")).not.toBeNull();

		// Wales has its own flag in the set the tooltips draw from, so the icon is the
		// dragon rather than the Union Jack.
		await hover("GB-WLS");
		expect(flagSrc()).toContain("gb-wls.svg");
		expect(container.querySelector(".country-tooltip")!.textContent).toContain("Wales");

		// A US state has no flag of its own in that set, so it keeps the national one.
		await hover("US-TX");
		expect(flagSrc()).toContain("/us.svg");
		expect(container.querySelector(".country-tooltip")!.textContent).toContain("Texas");
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

