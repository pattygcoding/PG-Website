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
 * back into ordinary samples. Three groups use one: connect_four (135
 * implementations), turing_machine (43) and rijandel_encryption (11).
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

const projectsData = { projects };

export { projects };
export default projectsData;
