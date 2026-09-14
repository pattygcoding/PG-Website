import english from "../../../assets/lang/en_us.json";
import projectsData from "../../../assets/projects/projects.json";
import skillsData from "../../../assets/skills/skills.json";

const featuredProjects = [
    { id: "takeoff_engine", domain: "products", skills: ["react", "node", "pipelines"], image: "takeoff_engine", x: 24, y: 19 },
    { id: "inventory_register", domain: "products", skills: ["angular", "node", "access"], image: "inventory_register", x: 73, y: 17 },
    { id: "grocery_app", domain: "products", skills: ["dotnet", "sql", "testing"], image: "grocery_app", x: 84, y: 49 },
    { id: "payrollobol", domain: "systems", skills: ["cobol", "sql", "svelte"], image: "payrollobol", x: 72, y: 81 },
    { id: "interop", domain: "systems", skills: ["interop", "testing"], image: "interop", x: 26, y: 81 },
    { id: "formatter", domain: "systems", skills: ["go", "wasm", "pipelines"], image: "formatter", to: "/formatter", x: 14, y: 49 },
    { id: "portfolio_website", domain: "experiences", skills: ["react", "wasm", "accessibility"], image: "portfolio_website", x: 48, y: 8 },
    { id: "biblioteca", domain: "experiences", skills: ["python", "pipelines"], image: "biblioteca", to: "/languages", x: 49, y: 92 },
];

const skillAliases = { reactjs: "react", nodejs: "node", webassembly: "wasm", unit_testing: "testing", postgreql: "postgresql" };
export const ATLAS_SKILL_LABELS = Object.fromEntries(Object.values(skillsData).flat().map(({ id, name }) => [skillAliases[id] || id, name]));
const domains = {
    connect_four: "experiences", snake: "experiences", suprememc: "experiences",
    tiger_tailgating_pros: "products", educational_experience: "experiences", professional_experience: "experiences",
};
const routes = { tiger_programming_language: "/tiger", snake: "/snake" };
const projectIds = [...featuredProjects.map(({ id }) => id), ...Object.keys(english.portfolio.entries).filter((id) => !featuredProjects.some((project) => project.id === id))];
export const ATLAS_HUB = "portfolio_website";
export const ATLAS_FAMILIES = [
    { id: "business", projects: ["takeoff_engine", "inventory_register", "grocery_app", "payrollobol", "tiger_tailgating_pros"] },
    { id: "minecraft", projects: ["suprememc", "minecraft_json_generator"] },
    { id: "wasm", projects: ["formatter", "snake", "tiger_programming_language"] },
    { id: "libraries", projects: ["powershell_library", "ruby_library", "lua_library", "excel_scripts"] },
    { id: "languages", projects: ["interop", "connect_four", "turing_machine", "rijandel_encryption"] },
    { id: "automation", projects: ["biblioteca", "python_maps", "pdf_builder", "neovim_config"] },
    { id: "experience", projects: ["professional_experience", "educational_experience"] },
].map((family, index, families) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / families.length;
    return { ...family, x: 50 + Math.cos(angle) * 34, y: 50 + Math.sin(angle) * 33 };
});
export const ATLAS_SIZE = { width: 2600, height: 2000 };

export const ATLAS_PROJECTS = projectIds.map((id) => {
    const featured = featuredProjects.find((project) => project.id === id);
    const skills = [...new Set([
        ...(featured?.skills || []),
        ...projectsData.projects.filter((project) => project.group === id).flatMap((project) => project.skills.map((skill) => skillAliases[skill] || skill)),
    ])];
    const family = ATLAS_FAMILIES.find((entry) => entry.projects.includes(id));
    const position = family?.projects.indexOf(id) || 0;
    const angle = -Math.PI / 2 + position * Math.PI * 2 / (family?.projects.length || 1);
    return {
        id, skills, domain: featured?.domain || domains[id] || "systems", image: id,
        to: featured?.to || routes[id],
        family: family?.id || "portfolio",
        x: family ? family.x + Math.cos(angle) * 230 / ATLAS_SIZE.width * 100 : 50,
        y: family ? family.y + Math.sin(angle) * 155 / ATLAS_SIZE.height * 100 : 50,
    };
});

export const ATLAS_CONNECTIONS = ATLAS_PROJECTS.flatMap((project, index) =>
    ATLAS_PROJECTS.slice(index + 1).flatMap((other) => {
        const hubConnection = project.id === ATLAS_HUB || other.id === ATLAS_HUB;
        if (!hubConnection && project.family !== other.family) return [];
        return [{ source: project.id, target: other.id, family: hubConnection ? "portfolio" : project.family }];
    })
);

export function filterAtlasProjects(domain, query, entries, skillLabels = {}) {
    const normalized = query.trim().toLocaleLowerCase();
    return ATLAS_PROJECTS.filter((project) =>
        (domain === "all" || project.domain === domain) &&
        (!normalized || `${entries[project.id]?.title || ""} ${project.skills.map((skill) => skillLabels[skill] || skill).join(" ")}`.toLocaleLowerCase().includes(normalized))
    );
}

export function getConnectedProjects(id) {
    return ATLAS_CONNECTIONS.flatMap((connection) => {
        if (connection.source === id) return [connection.target];
        if (connection.target === id) return [connection.source];
        return [];
    });
}