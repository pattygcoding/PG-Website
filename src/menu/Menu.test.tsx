import React from "react";
import { createRoot } from "react-dom/client";
import { act, Simulate } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import Menu from "./Menu";

vi.mock("@/lang/languageContext", () => ({ useLang: () => ({ t: (key: string) => key }) }));
vi.mock("./lang", () => ({ Lang: () => <button type="button">Language</button> }));
vi.mock("@/components/theme-toggle", () => ({ ThemeToggle: () => <button type="button">Theme</button> }));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
	vi.restoreAllMocks();
});

const click = (selector: string) => act(() => container.querySelector<HTMLElement>(selector)!.click());

function renderMenu(path = "/portfolio") {
	act(() => root.render(<MemoryRouter initialEntries={[path]}><Menu /><main><button>Background</button></main></MemoryRouter>));
	click('[aria-label="Open menu"]');
}

test("does not render viewport border overlays with the menu closed or open", () => {
	act(() => root.render(<MemoryRouter><Menu /></MemoryRouter>));
	expect(container.querySelector(".br-top, .br-bottom, .br-left, .br-right")).toBeNull();
	click('[aria-label="Open menu"]');
	expect(container.querySelector(".br-top, .br-bottom, .br-left, .br-right")).toBeNull();
});

test("opens a modal, locks the page, and restores focus on Escape", () => {
	renderMenu();
	expect(container.querySelector('[role="dialog"][aria-modal="true"]')).not.toBeNull();
	expect(document.body.classList.contains("ovhidden")).toBe(true);
	expect(container.querySelector("main")!.hasAttribute("inert")).toBe(true);
	act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
	expect(container.querySelector(".atlas-menu")).toBeNull();
	expect(document.body.classList.contains("ovhidden")).toBe(false);
	expect(container.querySelector("main")!.hasAttribute("inert")).toBe(false);
	expect(document.activeElement).toBe(container.querySelector('[aria-label="Open menu"]'));
});

test("previews hovered and keyboard-focused destinations without navigating", () => {
	renderMenu();
	expect(container.querySelector(".atlas-menu__preview h2")!.textContent).toBe("menu.portfolio");
	const about = container.querySelector('.atlas-menu__destination[href="/about"]')!;
	act(() => Simulate.mouseEnter(about));
	expect(container.querySelector(".atlas-menu__preview h2")!.textContent).toBe("menu.about");
	act(() => container.querySelector<HTMLElement>('.atlas-menu__destination[href="/contact"]')!.focus());
	expect(container.querySelector(".atlas-menu__preview h2")!.textContent).toBe("menu.contact");
	expect(container.querySelector('.atlas-menu__destination[aria-current="page"]')!.getAttribute("href")).toBe("/portfolio");
});

test("expands all project links and closes after selecting one", () => {
	renderMenu();
	const projects = container.querySelector<HTMLElement>('[aria-controls="menu-projects"]')!;
	act(() => projects.click());
	expect(projects.getAttribute("aria-expanded")).toBe("true");
	const arcade = container.querySelector<HTMLElement>(".atlas-menu__project-toggle")!;
	expect(arcade.getAttribute("aria-expanded")).toBe("false");
	expect(Array.from(container.querySelectorAll("#menu-projects a"), (link: Element) => link.getAttribute("href"))).toEqual(["https://arcade.pattygcoding.com", "https://connectfour.pattygcoding.com/", "/formatter", "/languages", "/tiger"]);
	act(() => arcade.click());
	expect(arcade.getAttribute("aria-expanded")).toBe("true");
	expect(Array.from(container.querySelectorAll("#menu-projects a"), (link: Element) => link.getAttribute("href"))).toEqual(["https://arcade.pattygcoding.com", "https://arcade.pattygcoding.com/alkalab", "https://arcade.pattygcoding.com/rustcraft", "https://arcade.pattygcoding.com/snake", "https://arcade.pattygcoding.com/suprememc", "https://connectfour.pattygcoding.com/", "/formatter", "/languages", "/tiger"]);
	click('#menu-projects a[href="/formatter"]');
	expect(container.querySelector(".atlas-menu")).toBeNull();
	expect(document.body.classList.contains("ovhidden")).toBe(false);
});

test("automatically expands the current project's group", () => {
	renderMenu("/tiger");
	expect(container.querySelector('[aria-controls="menu-projects"]')!.getAttribute("aria-expanded")).toBe("true");
	expect(container.querySelector('#menu-projects [aria-current="page"]')!.getAttribute("href")).toBe("/tiger");
});

test("wraps Tab and Shift+Tab inside the menu", () => {
	vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
	renderMenu();
	const first = container.querySelector(".site__header a");
	const last = container.querySelector<HTMLElement>('.atlas-menu__socials a:last-child')!;
	act(() => last.focus());
	act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", cancelable: true })));
	expect(document.activeElement).toBe(first);
	act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, cancelable: true })));
	expect(document.activeElement).toBe(last);
});

test("cleans up the scroll lock and preserves preexisting inert state", () => {
	act(() => root.render(<MemoryRouter><Menu /><main {...{ inert: "" }}><button>Background</button></main></MemoryRouter>));
	click('[aria-label="Open menu"]');
	click('[aria-label="Close menu"]');
	expect(container.querySelector("main")!.hasAttribute("inert")).toBe(true);
	expect(document.body.classList.contains("ovhidden")).toBe(false);
});