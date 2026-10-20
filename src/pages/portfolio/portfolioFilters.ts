export interface PortfolioProject {
	group: string;
	skills: string[];
}

export const readSkillSelection = (search: string, hash = ""): string[] => {
	const params = new URLSearchParams(search);
	const selection = params.has("skills") ? params.get("skills") : hash.replace(/^#/, "");
	return [...new Set((selection || "").split(",").map((skill) => skill.trim()).filter(Boolean))];
};

export const writeSkillSelection = (search: string, selectedSkills: string[]): string => {
	const params = new URLSearchParams(search);
	if (selectedSkills.length) params.set("skills", selectedSkills.join(","));
	else params.delete("skills");
	const query = params.toString();
	return query ? `?${query}` : "";
};

export const collectGroupSkills = (projects: PortfolioProject[]): Record<string, Set<string>> => {
	const groups: Record<string, Set<string>> = {};
	projects.forEach((project) => {
		groups[project.group] ||= new Set();
		project.skills.forEach((skill) => groups[project.group].add(skill));
	});
	return groups;
};

export const matchesSkills = (groupSkills: Set<string> | undefined, selectedSkills: string[]): boolean => (
	!selectedSkills.length || selectedSkills.some((skill) => groupSkills?.has(skill))
);

/**
 * The display options that belong in the URL alongside the skill filters: the view
 * and the sort, the values each accepts, and the value that means "leave it out".
 */
interface DisplayOptionSpec {
	values: readonly string[];
	fallback: string;
}

export type DisplayOption = "view" | "sort";

export const PORTFOLIO_DISPLAY: Record<DisplayOption, DisplayOptionSpec> = {
	view: { values: ["grid", "list"], fallback: "grid" },
	sort: { values: ["featured", "alphabetical"], fallback: "featured" },
};

/**
 * Reads a display option from the query string, falling back to its default when it
 * is absent or unrecognised, so a hand-edited URL cannot put the page into a state
 * its own controls do not offer.
 */
export const readDisplayOption = (search: string, option: DisplayOption): string => {
	const { values, fallback } = PORTFOLIO_DISPLAY[option];
	const value = new URLSearchParams(search).get(option);
	return value && values.includes(value) ? value : fallback;
};

/** Writes a display option, keeping the URL clean while the value is the default. */
export const writeDisplayOption = (search: string, option: DisplayOption, value: string): string => {
	const params = new URLSearchParams(search);
	if (value === PORTFOLIO_DISPLAY[option].fallback) params.delete(option);
	else params.set(option, value);
	const query = params.toString();
	return query ? `?${query}` : "";
};