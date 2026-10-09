export const readSkillSelection = (search, hash = "") => {
	const params = new URLSearchParams(search);
	const selection = params.has("skills") ? params.get("skills") : hash.replace(/^#/, "");
	return [...new Set((selection || "").split(",").map((skill) => skill.trim()).filter(Boolean))];
};

export const writeSkillSelection = (search, selectedSkills) => {
	const params = new URLSearchParams(search);
	if (selectedSkills.length) params.set("skills", selectedSkills.join(","));
	else params.delete("skills");
	const query = params.toString();
	return query ? `?${query}` : "";
};

export const collectGroupSkills = (projects) => {
	const groups = {};
	projects.forEach((project) => {
		groups[project.group] ||= new Set();
		project.skills.forEach((skill) => groups[project.group].add(skill));
	});
	return groups;
};

export const matchesSkills = (groupSkills, selectedSkills) => (
	!selectedSkills.length || selectedSkills.some((skill) => groupSkills?.has(skill))
);