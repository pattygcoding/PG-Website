import { ATLAS_PROJECTS, ATLAS_CONNECTIONS, ATLAS_FAMILIES, ATLAS_HUB, ATLAS_SIZE, ATLAS_SKILL_LABELS, filterAtlasProjects, getConnectedProjects } from "./atlasModel";
import english from "../../../assets/lang/en_us.json";
import links from "../../../assets/links/links.json";

const entries = Object.fromEntries(ATLAS_PROJECTS.map((project) => [project.id, { title: project.id }]));

test("each project and connection has a unique, valid identity", () => {
    const ids = ATLAS_PROJECTS.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
    const edges = ATLAS_CONNECTIONS.map(({ source, target, family }) => {
        expect(ids).toContain(source);
        expect(ids).toContain(target);
        expect(source).not.toBe(target);
        expect(family).toBeTruthy();
        return `${source}:${target}`;
    });
    expect(new Set(edges).size).toBe(edges.length);
});

test("filters intersect domain and case-insensitive technology search", () => {
    expect(filterAtlasProjects("all", "", entries).map(({ id }) => id).sort()).toEqual(Object.keys(english.portfolio.entries).sort());
    expect(filterAtlasProjects("products", "  REACT ", entries).map(({ id }) => id)).toEqual(["takeoff_engine", "tiger_tailgating_pros"]);
    expect(filterAtlasProjects("systems", "react", entries).every(({ domain, skills }) => domain === "systems" && skills.includes("react"))).toBe(true);
    expect(filterAtlasProjects("all", "grocery_app", entries).map(({ id }) => id)).toEqual(["grocery_app"]);
});

test("connections are bidirectional and stay within intentional project families", () => {
    expect(getConnectedProjects("takeoff_engine")).toContain("inventory_register");
    expect(getConnectedProjects("inventory_register")).toContain("takeoff_engine");
    expect(getConnectedProjects("takeoff_engine")).not.toContain("takeoff_engine");
    expect(getConnectedProjects("unknown")).toEqual([]);
    expect(getConnectedProjects("suprememc").sort()).toEqual([ATLAS_HUB, "minecraft_json_generator"].sort());
    expect(getConnectedProjects("rijandel_encryption").sort()).toEqual([ATLAS_HUB, "interop", "connect_four", "turing_machine"].sort());
    expect(getConnectedProjects("snake").sort()).toEqual([ATLAS_HUB, "formatter", "tiger_programming_language"].sort());
    expect(getConnectedProjects("powershell_library").sort()).toEqual([ATLAS_HUB, "ruby_library", "lua_library", "excel_scripts"].sort());
    expect(getConnectedProjects("takeoff_engine")).not.toContain("formatter");
    expect(getConnectedProjects("professional_experience")).not.toContain("connect_four");
});

test("every portfolio entry has one family and a hub connection, with no cross-family edges", () => {
    const members = ATLAS_FAMILIES.flatMap(({ projects }) => projects);
    expect(new Set(members).size).toBe(members.length);
    expect(members.slice().sort()).toEqual(ATLAS_PROJECTS.map(({ id }) => id).filter((id) => id !== ATLAS_HUB).sort());
    expect(getConnectedProjects(ATLAS_HUB).sort()).toEqual(members.slice().sort());
    ATLAS_CONNECTIONS.forEach(({ source, target, family }) => {
        if (family === "portfolio") expect([source, target]).toContain(ATLAS_HUB);
        else expect(ATLAS_FAMILIES.find(({ id }) => id === family).projects).toEqual(expect.arrayContaining([source, target]));
    });
});

test("clustered nodes fit the world without overlaps", () => {
    ATLAS_PROJECTS.forEach((project, index) => {
        const horizontal = project.x / 100 * ATLAS_SIZE.width;
        const vertical = project.y / 100 * ATLAS_SIZE.height;
        expect(horizontal).toBeGreaterThan(100);
        expect(horizontal).toBeLessThan(ATLAS_SIZE.width - 100);
        expect(vertical).toBeGreaterThan(60);
        expect(vertical).toBeLessThan(ATLAS_SIZE.height - 60);
        ATLAS_PROJECTS.slice(index + 1).forEach((other) => {
            expect(Math.abs(project.x - other.x) / 100 * ATLAS_SIZE.width > 210 || Math.abs(project.y - other.y) / 100 * ATLAS_SIZE.height > 116).toBe(true);
        });
    });
});

test("every atlas project has existing artwork, a destination, and English content", () => {
    ATLAS_PROJECTS.forEach((project) => {
        expect(english.portfolio.entries[project.id].link).toMatch(/^https:\/\//);
        expect(links.portfolio[project.image] || links.portfolio.default).toMatch(/\.png$/);
        expect(english.portfolio.entries[project.id].text).toBeTruthy();
        project.skills.forEach((skill) => expect(english.home.atlas.skills[skill] || ATLAS_SKILL_LABELS[skill]).toBeTruthy());
    });
});

test("uses title case for atlas family labels", () => {
    expect(english.home.atlas.family_connection).toBe("Project Connection");
    expect(english.home.atlas.families.libraries).toBe("Script Libraries");
});

test("search uses translated display labels rather than internal identifiers", () => {
    expect(filterAtlasProjects("all", "WebAssembly", english.portfolio.entries, english.home.atlas.skills).map(({ id }) => id)).toEqual(["formatter", "portfolio_website", "snake", "tiger_programming_language"]);
    expect(filterAtlasProjects("all", ".NET", english.portfolio.entries, { ...ATLAS_SKILL_LABELS, ...english.home.atlas.skills }).map(({ id }) => id)).toContain("grocery_app");
    expect(filterAtlasProjects("all", "Datenfluss", entries, { pipelines: "Datenfluss" })).toHaveLength(3);
});