import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import english from "@/assets/lang/en_us.json";
import Portfolio from "./Portfolio";

const { mockUseLang } = vi.hoisted(() => ({ mockUseLang: vi.fn() }));

vi.mock("@/lang/languageContext", async (importOriginal) => ({
	// Keep the real getLanguageTag (pure, and used by useProjectCounts); only
	// useLang is stubbed.
	...(await importOriginal<typeof import("@/lang/languageContext")>()),
	useLang: mockUseLang,
}));

// The dropdowns need popperjs and a real layout, which the display options do not,
// so they stand in as plain markup here. Which skills they offer is covered by the
// filter tests and the About page's table.
vi.mock("react-bootstrap", () => ({
	DropdownButton: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
	Dropdown: {
		Item: ({ children }: { children?: React.ReactNode }) => <button type="button">{children}</button>,
		Divider: () => null,
	},
	FormControl: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));
vi.mock("@/components/tab", () => ({ Tab: () => null }));

const resolve = (key: string): unknown =>
	key.split(".").reduce<unknown>(
		(value, part) => (value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined),
		english,
	);

// Reports the URL the page is sitting on, which is where the display options live.
const UrlTag = () => {
	const { search } = useLocation();
	return <output data-testid="url-tag">{search}</output>;
};

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	mockUseLang.mockReturnValue({ lang: "en_us", t: resolve });
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

const renderAt = (search: string) => {
	act(() => root.render(<MemoryRouter initialEntries={[`/portfolio${search}`]}><Portfolio /><UrlTag /></MemoryRouter>));
	return () => container.querySelector<HTMLOutputElement>('[data-testid="url-tag"]')!.textContent ?? "";
};

const view = (name: string) => container.querySelector<HTMLButtonElement>(`[aria-label="${name} view"]`)!;
const sort = () => container.querySelector<HTMLSelectElement>('select[aria-label="Sort projects"]')!;
const grid = () => container.querySelector(".portfolio-grid")!.className;

test("the view and sort tags in the URL drive the controls", () => {
	renderAt("?view=list&sort=alphabetical");
	expect(view("List").getAttribute("aria-pressed")).toBe("true");
	expect(view("Grid").getAttribute("aria-pressed")).toBe("false");
	expect(sort().value).toBe("alphabetical");
	expect(grid()).toContain("portfolio-view-list");
});

test("an unrecognised tag falls back to the default control", () => {
	renderAt("?view=carousel&sort=z-to-a");
	expect(view("Grid").getAttribute("aria-pressed")).toBe("true");
	expect(view("List").getAttribute("aria-pressed")).toBe("false");
	expect(sort().value).toBe("featured");
	expect(grid()).toContain("portfolio-view-grid");
});

test("changing the view writes the tag, and keeps the filters and language", () => {
	const url = renderAt("?skills=ruby&sort=alphabetical&lang=de_de");
	act(() => view("List").click());
	expect(url()).toBe("?skills=ruby&sort=alphabetical&lang=de_de&view=list");
	expect(container.querySelector(".portfolio-grid")!.className).toContain("portfolio-view-list");
	// The default goes back out of the URL, so a plain grid stays a plain URL.
	act(() => view("Grid").click());
	expect(url()).toBe("?skills=ruby&sort=alphabetical&lang=de_de");
});

test("changing the sort writes the tag, and the default drops out again", () => {
	const url = renderAt("?view=list");
	act(() => {
		sort().value = "alphabetical";
		sort().dispatchEvent(new Event("change", { bubbles: true }));
	});
	expect(url()).toBe("?view=list&sort=alphabetical");
	act(() => {
		sort().value = "featured";
		sort().dispatchEvent(new Event("change", { bubbles: true }));
	});
	expect(url()).toBe("?view=list");
});