import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/lang/languageContext";
import { projectCounts } from "@/assets/projects/projects";
import LinkedSkillsTable from "./LinkedSkillsTable";

const list = [
	{ id: "python", name: "Python" },
	{ id: "go", name: "Go" },
	{ id: "cobol", name: "COBOL" },
];
const projects = [
	{ label: "PROFESSIONAL EXPERIENCE: Acme", group: "professional_experience", link: "https://example.com/acme", skills: ["python", "docker"] },
	{ label: "Connect Four (Python)", group: "connect_four", link: "https://example.com/c4/python", skills: ["python"] },
	{ label: "Connect Four (Go)", group: "connect_four", link: "https://example.com/c4/go", skills: ["go"] },
	{ label: "Snake", group: "snake", link: "https://example.com/snake", skills: ["python", "docker"] },
];
const entries = { connect_four: { title: "Connect Four", text: "Many implementations.", link: "https://example.com/c4" } };
const skillNames = { python: "Python", go: "Go", cobol: "COBOL", docker: "Docker" };

const setInputValue = (input: HTMLInputElement, value: string) => {
	Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
	input.dispatchEvent(new Event("input", { bubbles: true }));
};

const renderExplorer = async (path = "/about") => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	await act(async () => root.render(
		<MemoryRouter initialEntries={[path]}>
			<LanguageProvider>
				<LinkedSkillsTable id="skills-test" header="Languages" list={list} projects={projects} entries={entries} skillNames={skillNames} />
			</LanguageProvider>
		</MemoryRouter>
	));
	return { container, cleanup: () => { act(() => root.unmount()); container.remove(); } };
};

const activeName = (container: HTMLElement): string | null => container.querySelector('[role="tab"][aria-selected="true"] .skill-index__name')!.textContent;
const detailTitle = (container: HTMLElement): string | null => container.querySelector(".skill-detail h4")!.textContent;

beforeAll(() => { Element.prototype.scrollIntoView = vi.fn(); });

test("lists skills alphabetically and selects the first one by default", async () => {
	const { container, cleanup } = await renderExplorer();
	try {
		expect([...container.querySelectorAll('[role="tab"] .skill-index__name')].map((el) => el.textContent)).toEqual(["COBOL", "Go", "Python"]);
		expect(activeName(container)).toBe("COBOL");
	} finally {
		cleanup();
	}
});

test("shows grouped details for the selected skill", async () => {
	const { container, cleanup } = await renderExplorer("/about#python");
	try {
		expect(detailTitle(container)).toBe("Python");
		expect(container.querySelector(".skill-detail__summary")!.textContent).toBe("Used professionally at Acme. Also applied in Connect Four and Snake.");
		expect(container.querySelector(".skill-detail dl, .skill-index__count")).toBeNull();
		expect(container.querySelector(".skill-experience span")!.textContent).toBe("Acme");
		const cards = [...container.querySelectorAll(".skill-project-card__title a")].map((a) => a.textContent);
		expect(cards).toEqual(["Connect Four", "Snake"]);
		expect([...container.querySelectorAll(".skill-related button")].map((b) => b.textContent)).toEqual(["Docker"]);
	} finally {
		cleanup();
	}
});

test("filters the list and selects the first match on Enter", async () => {
	const { container, cleanup } = await renderExplorer();
	try {
		const input = container.querySelector<HTMLInputElement>(".skill-search input")!;
		await act(async () => setInputValue(input, "py"));
		expect([...container.querySelectorAll('[role="tab"]')].map((tab) => tab.textContent)).toEqual(["Python"]);
		await act(async () => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
		expect(detailTitle(container)).toBe("Python");
	} finally {
		cleanup();
	}
});

test("shows a positive fallback for skills without published work", async () => {
	const { container, cleanup } = await renderExplorer("/about#cobol");
	try {
		expect(detailTitle(container)).toBe("COBOL");
		expect(container.querySelector(".skill-detail__summary")!.textContent).toContain("Part of my working toolkit");
		expect(container.querySelector('.skill-detail__summary a[href="/contact"]')).not.toBeNull();
	} finally {
		cleanup();
	}
});

test("supports arrow-key navigation through the list", async () => {
	const { container, cleanup } = await renderExplorer();
	try {
		const active = container.querySelector('[role="tab"][aria-selected="true"]')!;
		await act(async () => active.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
		expect(detailTitle(container)).toBe("Go");
		expect(document.activeElement!.textContent).toContain("Go");
	} finally {
		cleanup();
	}
});

test("opens the skill referenced by the URL hash", async () => {
	const { container, cleanup } = await renderExplorer("/about#go");
	try {
		expect(activeName(container)).toBe("Go");
		expect(container.querySelector(".skill-detail__summary")!.textContent).toBe("Applied hands-on in Connect Four.");
		expect(container.querySelector(".skill-project-card__title a")!.getAttribute("href")).toBe("https://example.com/c4/go");
	} finally {
		cleanup();
	}
});

test("collapses long version lists behind an expandable chip", async () => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const many = Array.from({ length: 12 }, (_, i) => ({ label: `Connect Four (V${i})`, group: "connect_four", link: `https://example.com/v${i}`, skills: ["go"] }));
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		await act(async () => root.render(
			<MemoryRouter initialEntries={["/about#go"]}>
				<LanguageProvider>
					<LinkedSkillsTable id="skills-test" header="Languages" list={list} projects={many} entries={entries} skillNames={skillNames} />
				</LanguageProvider>
			</MemoryRouter>
		));
		const chips = () => container.querySelectorAll(".skill-project-card__variants a").length;
		const more = container.querySelector<HTMLElement>(".skill-project-card__more")!;
		expect(chips()).toBe(8);
		expect(more.textContent).toBe("+ more");
		await act(async () => more.click());
		expect(chips()).toBe(12);
		expect(more.textContent).toBe("Show less");
	} finally {
		act(() => root.unmount());
		container.remove();
	}
});

test("clamps the variants by rendered rows instead of a fixed count", async () => {
	const heightDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight")!;
	const topDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetTop")!;
	// jsdom lays nothing out, so stand in for a one-chip-per-row layout: every chip
	// is 26px tall and starts a row of its own, which the card then measures itself.
	Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get(this: HTMLElement) { return this.tagName === "A" ? 26 : 0; } });
	Object.defineProperty(HTMLElement.prototype, "offsetTop", { configurable: true, get(this: HTMLElement) { return [...(this.parentElement?.children ?? [])].indexOf(this) * 32; } });
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const many = Array.from({ length: 12 }, (_, i) => ({ label: `Interop with V${i}`, group: "interop", link: `https://example.com/v${i}`, skills: ["go"] }));
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		await act(async () => root.render(
			<MemoryRouter initialEntries={["/about#go"]}>
				<LanguageProvider>
					<LinkedSkillsTable id="skills-test" header="Languages" list={list} projects={many} entries={entries} skillNames={skillNames} />
				</LanguageProvider>
			</MemoryRouter>
		));
		expect(container.querySelectorAll(".skill-project-card__variants a").length).toBe(2);
		expect(container.querySelector(".skill-project-card__more")!.textContent).toBe("+ more");
	} finally {
		act(() => root.unmount());
		container.remove();
		Object.defineProperty(HTMLElement.prototype, "offsetHeight", heightDescriptor);
		Object.defineProperty(HTMLElement.prototype, "offsetTop", topDescriptor);
	}
});

test("clamps a short variant list that still overflows two rows", async () => {
	const heightDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight")!;
	const topDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetTop")!;
	// Fewer variants than MAX_VARIANTS, so nothing is hidden on the first render and
	// no "+ more" chip is drawn yet; the row clamp still has to trim the chip that
	// reaches the third row.
	Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get(this: HTMLElement) { return this.tagName === "A" ? 26 : 0; } });
	Object.defineProperty(HTMLElement.prototype, "offsetTop", { configurable: true, get(this: HTMLElement) { return [...(this.parentElement?.children ?? [])].indexOf(this) * 32; } });
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const four = Array.from({ length: 4 }, (_, i) => ({ label: `Interop with C & V${i}`, group: "interop", link: `https://example.com/i${i}`, skills: ["go"] }));
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		await act(async () => root.render(
			<MemoryRouter initialEntries={["/about#go"]}>
				<LanguageProvider>
					<LinkedSkillsTable id="skills-test" header="Languages" list={list} projects={four} entries={entries} skillNames={skillNames} />
				</LanguageProvider>
			</MemoryRouter>
		));
		expect(container.querySelectorAll(".skill-project-card__variants a").length).toBe(2);
		expect(container.querySelector(".skill-project-card__more")!.textContent).toBe("+ more");
	} finally {
		act(() => root.unmount());
		container.remove();
		Object.defineProperty(HTMLElement.prototype, "offsetHeight", heightDescriptor);
		Object.defineProperty(HTMLElement.prototype, "offsetTop", topDescriptor);
	}
});

test("fills a project card's count tokens from projects.json", async () => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const withTokens = { connect_four: { title: "Connect Four", text: "A family of {implementations} implementations.", link: "https://example.com/c4" } };
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		await act(async () => root.render(
			<MemoryRouter initialEntries={["/about#go"]}>
				<LanguageProvider>
					<LinkedSkillsTable id="skills-test" header="Languages" list={list} projects={projects} entries={withTokens} skillNames={skillNames} />
				</LanguageProvider>
			</MemoryRouter>
		));
		const text = container.querySelector(".skill-project-card > p")!.textContent!;
		expect(text).toBe(`A family of ${projectCounts.connect_four.implementations} implementations.`);
		// A raw placeholder here was the bug: the card must never show "{implementations}".
		expect(text).not.toMatch(/\{[A-Za-z_]/);
	} finally {
		act(() => root.unmount());
		container.remove();
	}
});

test("shortens interop chips to the two languages they pair", async () => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const interop = [
		{ label: "Interop with C & Python", group: "interop", link: "https://example.com/i1", skills: ["go"] },
		{ label: "Interop with C & Assembly x64", group: "interop", link: "https://example.com/i2", skills: ["go"] },
		{ label: "Interop with Java & Kotlin", group: "interop", link: "https://example.com/i3", skills: ["go"] },
	];
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		await act(async () => root.render(
			<MemoryRouter initialEntries={["/about#go"]}>
				<LanguageProvider>
					<LinkedSkillsTable id="skills-test" header="Languages" list={list} projects={interop} entries={entries} skillNames={skillNames} />
				</LanguageProvider>
			</MemoryRouter>
		));
		expect([...container.querySelectorAll(".skill-project-card__variants a")].map((chip) => chip.textContent))
			.toEqual(["C & Python", "C & Assembly x64", "Java & Kotlin"]);
		// The projects.json wording still heads the card.
		expect(container.querySelector(".skill-project-card__title a")!.textContent).toContain("Interop with C & Python");
	} finally {
		act(() => root.unmount());
		container.remove();
	}
});
test("opens a family's first page for the selected skill instead of its landing page", async () => {
	global.IS_REACT_ACT_ENVIRONMENT = true;
	const pages = [
		{ label: "Connect Four (Python)", group: "connect_four", link: "https://github.com/pattygcoding/Neo-Connect-Four-Language-Tree/tree/main/Python", skills: ["python"] },
		{ label: "Connect Four (Django)", group: "connect_four", link: "https://github.com/pattygcoding/Neo-Connect-Four-Language-Tree/tree/main/Django", skills: ["python"] },
		{ label: "Interop with Python & C++", group: "interop", link: "https://interop.pattygcoding.com/python-cpp", skills: ["python"] },
		{ label: "Interop with Python & Java", group: "interop", link: "https://interop.pattygcoding.com/python-java", skills: ["python"] },
	];
	const cards = {
		connect_four: { title: "Connect Four", text: "Many implementations.", link: "https://connectfour.pattygcoding.com" },
		interop: { title: "Interop Samples", text: "Pairings.", link: "https://interop.pattygcoding.com/" },
	};
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);
	try {
		await act(async () => root.render(
			<MemoryRouter initialEntries={["/about#python"]}>
				<LanguageProvider>
					<LinkedSkillsTable id="skills-test" header="Languages" list={list} projects={pages} entries={cards} skillNames={skillNames} />
				</LanguageProvider>
			</MemoryRouter>
		));
		// A family whose samples are pages on its own site opens the first page for this
		// skill; samples that live in a repository keep the project's own address.
		expect([...container.querySelectorAll(".skill-project-card__title a")].map((card) => [card.textContent, card.getAttribute("href")]))
			.toEqual([
				["Connect Four", "https://connectfour.pattygcoding.com"],
				["Interop Samples", "https://interop.pattygcoding.com/python-cpp"],
			]);
	} finally {
		act(() => root.unmount());
		container.remove();
	}
});




