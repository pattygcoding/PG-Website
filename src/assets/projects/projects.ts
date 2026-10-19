import projectsJson from "./projects.json";
import skillsJson from "../skills/skills.json";

export interface ProjectSample {
	link: string;
	label: string;
	group: string;
	skills: string[];
}

/**
 * A group whose entries all share a URL base, a label prefix and the
 * git/github/vscode skills is stored in `projects.json` as one compact block
 * instead of dozens of near-identical entries; this module expands such a block
 * back into ordinary samples. The sample-shaped groups are connect_four,
 * turing_machine and rijandel_encryption, and interop is the fourth; how many
 * samples each carries is counted in `projectCounts` below rather than written
 * into the copy, so the descriptions cannot drift as samples are added.
 *
 * rijandel_encryption links to the encryption.pattygcoding.com showcase instead
 * of GitHub, so its sample ids are that site's language slugs (c, cpp, csharp,
 * …) rather than the repository's folder names.
 *
 * A sample is a bare id when the folder, skill id and skills.json name all agree,
 * otherwise an object:
 *
 *   "ada"
 *   { "id": "Ada", "skill": "ada" }
 *   { "id": "maui", "skill": "dotnet_maui", "skills": ["dotnet", "dotnet_core", "csharp"] }
 *   { "id": "wpf", "name": "WPF - C#", "skill": "wpf", "skills": ["csharp", "dotnet", "dotnet_core"] }
 *
 * `id`     the URL slug, appended to the block's `link_base`
 * `skill`  the primary skill: first tag, and the source of the display name
 * `skills` extra tags, placed after the primary and before the shared ones
 * `name`   only when skills.json cannot supply the label (HTML/CSS, VB.NET,
 *          Express, React, Spring Boot, Vue, WPF - C#, WPF - VB.NET, Assembly
 *          x64, Assembly x86)
 * `tags`   the complete tag list, for the entries the shared ordering does not
 *          fit (Bash and PowerShell list `shell` before `vscode`)
 *
 * Interop is the other shape: one entry per language pair, written as
 * `[left, right, bitWidth?]`. skills.json supplies both names, the folder is
 * `<Left>/<Left> with <Right>[ (64bit|32bit)]` and the label is
 * `Interop with <Left> & <Right>[ x64|x86]`.
 *
 *   ["java", "clojure"]
 *   ["c", "assembly", "64bit"]
 */
interface CompactSample {
	id: string;
	name?: string;
	skill?: string;
	skills?: string[];
	tags?: string[];
}

type InteropSample = [string, string, string?];

/**
 * A compact stand-in for many samples of one group: `expand` marks the entry as a
 * block rather than a sample, and `group` selects its expander in `EXPAND_BLOCKS`.
 */
interface ExpandBlock {
	group: string;
	expand: boolean;
	label: string;
	link_base: string;
	common_skills: string[];
	samples: unknown[];
}

const skillNames: Record<string, string> = Object.fromEntries(
	[...skillsJson.languages, ...skillsJson.frameworks, ...skillsJson.other_technologies].map(({ id, name }) => [id, name]),
);

const INTEROP_BITS: Record<string, string> = { "64bit": "x64", "32bit": "x86" };

// A slug is stored decoded so it stays readable (C++, Assembly/64bit) and encoded
// again here, per path segment, exactly the way GitHub's URLs spell it.
const encodePath = (path: string): string => path.split("/").map(encodeURIComponent).join("/");

const expandSamples = ({ group, label, link_base, common_skills, samples }: ExpandBlock): ProjectSample[] =>
	(samples as Array<string | CompactSample>).map((sample) => {
		const { id, name, skill, skills = [], tags }: CompactSample = typeof sample === "string" ? { id: sample, skill: sample } : sample;
		return {
			link: link_base + encodePath(id),
			label: `${label} (${name || (skill && skillNames[skill]) || id})`,
			group,
			skills: tags ? [...tags] : [...(skill ? [skill] : []), ...skills, ...common_skills],
		};
	});

const expandInterop = ({ group, label, link_base, common_skills, samples }: ExpandBlock): ProjectSample[] =>
	(samples as InteropSample[]).map(([left, right, bits]) => {
		const folder = skillNames[left];
		const partner = skillNames[right];
		const path = `${folder}/${folder} with ${partner}${bits ? ` (${bits})` : ""}`;
		return {
			link: link_base + encodePath(path),
			label: `${label} ${folder} & ${partner}${bits ? ` ${INTEROP_BITS[bits]}` : ""}`,
			group,
			skills: [left, right, ...common_skills],
		};
	});

const EXPAND_BLOCKS: Record<string, (block: ExpandBlock) => ProjectSample[]> = {
	connect_four: expandSamples,
	turing_machine: expandSamples,
	rijandel_encryption: expandSamples,
	interop: expandInterop,
};

const isExpandBlock = (entry: unknown): entry is ExpandBlock =>
	typeof entry === "object" && entry !== null && (entry as { expand?: unknown }).expand === true;

// Blocks are stored inside `projects`, where their position matters: the About
// page lists a skill's projects in first-seen order, so expanding in place keeps
// that order exactly as it was when every entry was spelled out.
const source = projectsJson.projects as unknown as Array<ProjectSample | ExpandBlock>;

const expand = (block: ExpandBlock): ProjectSample[] => {
	const expander = EXPAND_BLOCKS[block.group];
	if (!expander) throw new Error(`projects.json has an expand block for an unknown group: ${block.group}`);
	return expander(block);
};

const projects: ProjectSample[] = source.flatMap((entry) => (isExpandBlock(entry) ? expand(entry) : [entry]));

/** Classifies a group's skills so a description can count languages and frameworks apart. */
const languageIds = new Set(skillsJson.languages.map(({ id }) => id));
const frameworkIds = new Set(skillsJson.frameworks.map(({ id }) => id));

interface GroupCounts {
	/** Expanded samples in the group: the implementations the family demonstrates. */
	implementations: number;
	/** Distinct programming languages those samples use. */
	languages: number;
	/** Distinct frameworks, libraries, runtimes and databases those samples use. */
	frameworks: number;
}

const countGroup = (group: string): GroupCounts => {
	const members = projects.filter((sample) => sample.group === group);
	const used = new Set(members.flatMap((sample) => sample.skills));
	return {
		implementations: members.length,
		languages: [...used].filter((id) => languageIds.has(id)).length,
		frameworks: [...used].filter((id) => frameworkIds.has(id)).length,
	};
};

const connectFour = countGroup("connect_four");
const interop = countGroup("interop");
const rijandel = countGroup("rijandel_encryption");
const turing = countGroup("turing_machine");

/**
 * Values for the `{token}` placeholders the project descriptions quote, keyed by the
 * `portfolio.entries` id. `interop` counts language pairs as execution patterns,
 * which is what its copy calls them.
 *
 * Counted here instead of being spelled out in the locale files: `lang.py` passes
 * `{token}` through translation untouched, so one edit to the data reaches every
 * language at once. See `interpolateCounts` for the substitution.
 */
export const projectCounts: Record<string, Record<string, number>> = {
	connect_four: { implementations: connectFour.implementations, languages: connectFour.languages, frameworks: connectFour.frameworks },
	interop: { languages: interop.languages, patterns: interop.implementations },
	rijandel_encryption: { implementations: rijandel.implementations },
	turing_machine: { implementations: turing.implementations },
};

const projectsData = { projects };

export { projects };
export default projectsData;
