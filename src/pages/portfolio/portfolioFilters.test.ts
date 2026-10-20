import { readSkillSelection, writeSkillSelection, readDisplayOption, writeDisplayOption, collectGroupSkills, matchesSkills } from "./portfolioFilters";
import projectsData from "../../assets/projects/projects";

test("preserves query-based resume links and supports skill hashes", () => {
	expect(readSkillSelection("?skills=javascript&lang=en_us")).toEqual(["javascript"]);
	expect(readSkillSelection("?lang=en_us", "#javascript")).toEqual(["javascript"]);
	expect(readSkillSelection("?skills=python", "#javascript")).toEqual(["python"]);
	expect(readSkillSelection("?skills=javascript,python,javascript")).toEqual(["javascript", "python"]);
	expect(readSkillSelection("?skills=", "#javascript")).toEqual([]);
});

test("changing and clearing filters retains unrelated URL parameters", () => {
	const search = writeSkillSelection("?lang=es_es&source=resume", ["javascript", "python"]);
	expect(new URLSearchParams(search).get("skills")).toBe("javascript,python");
	expect(writeSkillSelection(search, [])).toBe("?lang=es_es&source=resume");
	expect(writeSkillSelection("?skills=javascript", [])).toBe("");
});

test("every JavaScript work sample contributes to visible portfolio groups", () => {
	const groups = collectGroupSkills(projectsData.projects);
	const expected = [...new Set(projectsData.projects.filter((project) => project.skills.includes("javascript")).map((project) => project.group))].sort();
	const actual = Object.keys(groups).filter((group) => matchesSkills(groups[group], ["javascript"])).sort();
	expect(actual).toEqual(expected);
	expect(actual.length).toBeGreaterThan(0);
});

test("multiple skills use union matching, including skills from later group entries", () => {
	const groups = collectGroupSkills([
		{ group: "sample", skills: ["python"] },
		{ group: "sample", skills: ["javascript"] },
	]);
	expect(matchesSkills(groups.sample, ["javascript", "go"])).toBe(true);
	expect(matchesSkills(groups.sample, ["go"])).toBe(false);
	expect(matchesSkills(undefined, [])).toBe(true);
		expect(matchesSkills(undefined, ["javascript"])).toBe(false);
});

test("display options default when the URL says nothing about them", () => {
	expect(readDisplayOption("", "view")).toBe("grid");
	expect(readDisplayOption("?lang=de_de", "sort")).toBe("featured");
});

test("display options fall back on values the controls do not offer", () => {
	expect(readDisplayOption("?view=carousel&sort=z-to-a", "view")).toBe("grid");
	expect(readDisplayOption("?view=carousel&sort=z-to-a", "sort")).toBe("featured");
});

test("writing a display option keeps the filters and drops the default again", () => {
	expect(writeDisplayOption("?skills=ruby&lang=de_de", "view", "list")).toBe("?skills=ruby&lang=de_de&view=list");
	expect(writeDisplayOption("?skills=ruby&view=list", "view", "grid")).toBe("?skills=ruby");
	expect(writeDisplayOption("?skills=ruby&view=list", "sort", "alphabetical")).toBe("?skills=ruby&view=list&sort=alphabetical");
	expect(writeDisplayOption("", "view", "grid")).toBe("");
});

test("a written display option reads back as itself", () => {
	const written = writeDisplayOption(writeDisplayOption("", "view", "list"), "sort", "alphabetical");
	expect(readDisplayOption(written, "view")).toBe("list");
	expect(readDisplayOption(written, "sort")).toBe("alphabetical");
});