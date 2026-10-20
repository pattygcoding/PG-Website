import { showcaseProjects } from "./showcase";
import { showcaseProjectIds } from "@/assets/projects/rankings";
import english from "@/assets/lang/en_us.json";
import links from "@/assets/links/links.json";

const entries = english.portfolio.entries as Record<string, { link: string }>;
const images = links.portfolio as Record<string, string>;
const badgeKeys = Object.keys(english.home.featured.badges);

test("the showcase is the ranked projects, with the lead card first", () => {
	expect(showcaseProjects.map(({ key }) => key)).toEqual(showcaseProjectIds);
	expect(showcaseProjects[0].featured).toBe(true);
	expect(showcaseProjects.slice(1).every(({ featured }) => !featured)).toBe(true);
});

test("every card carries what the home page renders", () => {
	for (const project of showcaseProjects) {
		// The artwork the card shows, the badges above its title, and somewhere to go.
		expect(images[project.key]).toBeTruthy();
		expect(project.image).toBe(images[project.key]);
		expect(project.badges.length).toBeGreaterThan(0);
		project.badges.forEach((badge) => expect(badgeKeys).toContain(badge));
		expect(project.to ?? entries[project.key].link).toBeTruthy();
		expect(project.dataKey === undefined || project.dataKey === "languages").toBe(true);
	}
});

test("only the projects with a page of their own open in-app", () => {
	const inApp = showcaseProjects.filter(({ to }) => to).map(({ key, to }) => `${key} ${to}`);
	inApp.forEach((entry) => expect(entry).toMatch(/^(formatter \/formatter|biblioteca \/languages|tiger_programming_language \/tiger)$/));
	expect(inApp.length).toBeGreaterThan(0);
});