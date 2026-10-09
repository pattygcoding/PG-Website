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