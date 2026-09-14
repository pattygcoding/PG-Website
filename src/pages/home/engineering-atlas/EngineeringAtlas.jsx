import React, { useEffect, useRef, useState } from "react";
import { FiArrowDown, FiArrowRight, FiArrowUpRight, FiCheck, FiGrid, FiList, FiPause, FiPlay, FiSearch, FiShare2, FiX } from "react-icons/fi";
import { useLang } from "@/lang/languageContext";
import { LangAwareLink } from "@/components/lang-aware-link";
import links from "@/assets/links/links.json";
import english from "@/assets/lang/en_us.json";
import { ATLAS_PROJECTS, ATLAS_CONNECTIONS, ATLAS_FAMILIES, ATLAS_HUB, ATLAS_SKILL_LABELS, filterAtlasProjects, getConnectedProjects } from "./atlasModel";
import AtlasCanvas from "./AtlasCanvas";
import AtlasMap from "./AtlasMap";
import "./EngineeringAtlas.css";

export function AtlasInvitation() {
    const { t } = useLang();
    return (
        <a className="atlas-invitation" href="#engineering-atlas">
            <span className="atlas-invitation-icon"><FiShare2 aria-hidden="true" /></span>
            <span><small>{t("home.atlas.invitation_kicker")}</small><strong>{t("home.atlas.invitation")}</strong></span>
            <FiArrowDown aria-hidden="true" />
        </a>
    );
}

export default function EngineeringAtlas() {
    const { t } = useLang();
    const [selectedId, setSelectedId] = useState(ATLAS_HUB);
    const [domain, setDomain] = useState("all");
    const [query, setQuery] = useState("");
    const [view, setView] = useState("map");
    const [paused, setPaused] = useState(false);
    const inspectorRef = useRef(null);
    const entries = Object.fromEntries(ATLAS_PROJECTS.map(({ id }) => [id, t(`portfolio.entries.${id}`)]));
    const labels = {
        ...english.home.atlas, ...t("home.atlas"),
        skills: { ...ATLAS_SKILL_LABELS, ...english.home.atlas.skills, ...t("home.atlas.skills") },
        stories: { ...english.home.atlas.stories, ...t("home.atlas.stories") },
        families: { ...english.home.atlas.families, ...t("home.atlas.families") },
    };
    const visible = filterAtlasProjects(domain, query, entries, labels.skills);
    const visibleIds = visible.map((project) => project.id);
    const selected = visible.find((project) => project.id === selectedId) || visible[0];
    const currentId = selected?.id;
    useEffect(() => {
        if (inspectorRef.current) inspectorRef.current.scrollTop = 0;
    }, [currentId]);
    const connected = selected ? getConnectedProjects(selected.id) : [];
    const activeConnections = ATLAS_CONNECTIONS.filter(({ source, target }) => visibleIds.includes(source) && visibleIds.includes(target));
    const selectProject = (id) => setSelectedId(id);
    const resetFilters = () => { setDomain("all"); setQuery(""); };
    const selectRelated = (id) => { resetFilters(); selectProject(id); };
    const openContent = <>{selected?.to ? labels.open_live : labels.open_project}<FiArrowUpRight aria-hidden="true" /></>;

    return (
        <section className="engineering-atlas" id="engineering-atlas" aria-labelledby="atlas-title">
            <div className="atlas-inner">
                <header className="atlas-header">
                    <div>
                        <span className="atlas-eyebrow"><FiShare2 aria-hidden="true" />{labels.kicker}</span>
                        <h2 id="atlas-title">{labels.title}<span aria-hidden="true">.</span></h2>
                    </div>
                    <div className="atlas-totals">
                        <span><strong>{String(ATLAS_PROJECTS.length).padStart(2, "0")}</strong>{labels.projects}</span>
                        <span><strong>{String(new Set(ATLAS_PROJECTS.flatMap(({ skills }) => skills)).size).padStart(2, "0")}</strong>{labels.technologies}</span>
                        <span><strong>{String(ATLAS_CONNECTIONS.length).padStart(2, "0")}</strong>{labels.connections}</span>
                    </div>
                </header>

                <div className="atlas-toolbar">
                    <div className="atlas-filters" role="group" aria-label={labels.filter_label}>
                        {["all", "products", "systems", "experiences"].map((value) => (
                            <button type="button" key={value} aria-pressed={domain === value} onClick={() => setDomain(value)}>
                                {labels.domains[value]}
                            </button>
                        ))}
                    </div>
                    <div className="atlas-tools">
                        <label className="atlas-search">
                            <FiSearch aria-hidden="true" />
                            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.search} aria-label={labels.search} />
                        </label>
                        <div className="atlas-view-switch" role="group" aria-label={labels.view_label}>
                            <button type="button" title={labels.map_view} aria-label={labels.map_view} aria-pressed={view === "map"} onClick={() => setView("map")}><FiGrid aria-hidden="true" /></button>
                            <button type="button" title={labels.list_view} aria-label={labels.list_view} aria-pressed={view === "list"} onClick={() => setView("list")}><FiList aria-hidden="true" /></button>
                        </div>
                        <button type="button" className="atlas-motion" title={paused ? labels.resume : labels.pause} aria-label={paused ? labels.resume : labels.pause} aria-pressed={paused} onClick={() => setPaused(!paused)}>
                            {paused ? <FiPlay aria-hidden="true" /> : <FiPause aria-hidden="true" />}
                        </button>
                    </div>
                </div>

                <div className="atlas-workspace">
                    <div className={`atlas-map-region atlas-map-region--${view}`}>
                        <div className="atlas-map-status" aria-live="polite">
                            <span className="atlas-status-dot" />{visible.length} / {ATLAS_PROJECTS.length} {labels.projects}
                            <span>{activeConnections.length} {labels.connections}</span>
                        </div>
                        {visible.length ? (
                            <div className={`atlas-board atlas-board--${view}`} role="group" aria-label={labels.project_selector}>
                                <AtlasMap selected={selected?.id} disabled={view !== "map"} labels={labels}>
                                {view === "map" && <>
                                    <AtlasCanvas selected={selected?.id} visibleIds={visibleIds} paused={paused} />
                                    {ATLAS_FAMILIES.filter((family) => family.projects.some((id) => visibleIds.includes(id))).map((family) => (
                                        <div key={family.id} className="atlas-family-label" style={{ left: `${family.x}%`, top: `${family.y}%` }}>
                                            <span>{labels.families[family.id]}</span>
                                            <small>{family.projects.filter((id) => visibleIds.includes(id)).length} {labels.projects}</small>
                                        </div>
                                    ))}
                                </>}
                                {ATLAS_PROJECTS.map((project, index) => {
                                    if (!visibleIds.includes(project.id)) return null;
                                    const isSelected = selected?.id === project.id;
                                    return (
                                        <button type="button" key={project.id}
                                            className={`atlas-node atlas-node--${project.domain}${project.id === ATLAS_HUB ? " atlas-node--hub" : ""}${isSelected ? " is-selected" : ""}${connected.includes(project.id) ? " is-connected" : ""}`}
                                            data-project-id={project.id}
                                            style={{ "--node-x": `${project.x}%`, "--node-y": `${project.y}%` }}
                                            aria-pressed={isSelected} aria-controls="atlas-inspector" onClick={() => selectProject(project.id)}>
                                            <span className="atlas-node-index">{String(index + 1).padStart(2, "0")}</span>
                                            <img src={`/assets/images/${links.portfolio[project.image] || links.portfolio.default}`} alt="" draggable="false" loading="lazy" width="36" height="36" />
                                            <span className="atlas-node-title">{entries[project.id].title}</span>
                                            <span className="atlas-node-skills">{project.skills.slice(0, 4).map((skill) => labels.skills[skill]).join(" / ")}</span>
                                            <span className="atlas-node-indicator" aria-hidden="true">{isSelected ? <FiCheck /> : <FiArrowUpRight />}</span>
                                        </button>
                                    );
                                })}
                                </AtlasMap>
                            </div>
                        ) : (
                            <div className="atlas-empty"><FiSearch aria-hidden="true" /><h3>{labels.no_results}</h3><button type="button" onClick={resetFilters}><FiX aria-hidden="true" />{labels.reset}</button></div>
                        )}
                        <div className="atlas-map-footer">
                            <span><i className="atlas-line-key" />{labels.family_connection}</span>
                            <span><i className="atlas-line-key atlas-line-key--hub" />{labels.portfolio_connection}</span>
                            {(query || domain !== "all") && <button type="button" onClick={resetFilters}><FiX aria-hidden="true" />{labels.reset}</button>}
                            <span>{labels.browser_native}</span>
                        </div>
                    </div>

                    <aside ref={inspectorRef} className="atlas-inspector" id="atlas-inspector" aria-label={labels.inspector}>
                        {selected ? <div key={selected.id} className="atlas-inspector-content">
                            <div className="atlas-inspector-top"><span>{labels.domains[selected.domain]}</span><span>{String(ATLAS_PROJECTS.indexOf(selected) + 1).padStart(2, "0")} / {String(ATLAS_PROJECTS.length).padStart(2, "0")}</span></div>
                            <div className="atlas-project-art"><img src={`/assets/images/${links.portfolio[selected.image] || links.portfolio.default}`} alt="" loading="lazy" width="180" height="120" /></div>
                            <h3 aria-live="polite">{entries[selected.id].title}</h3>
                            <p className="atlas-summary">{labels.stories[selected.id]?.summary || entries[selected.id].text}</p>
                            <div className="atlas-stack">{selected.skills.slice(0, 8).map((skill) => <span key={skill}>{labels.skills[skill]}</span>)}</div>
                            {selected.skills.length > 8 && <details className="atlas-all-skills"><summary>{labels.all_technologies} ({selected.skills.length})</summary><div className="atlas-stack">{selected.skills.slice(8).map((skill) => <span key={skill}>{labels.skills[skill]}</span>)}</div></details>}
                            {labels.stories[selected.id]?.lens && <div className="atlas-lens"><h4>{labels.engineering_lens}</h4><p>{labels.stories[selected.id].lens}</p></div>}
                            {selected.to ? <LangAwareLink to={selected.to} className="atlas-open">{openContent}</LangAwareLink> : <a href={entries[selected.id].link} target="_blank" rel="noopener noreferrer" className="atlas-open">{openContent}</a>}
                            {connected.length > 0 && <div className="atlas-related"><h4>{labels.connected_work}</h4>{connected.map((id) => {
                                const relationship = selected.id === ATLAS_HUB || id === ATLAS_HUB ? "portfolio" : selected.family;
                                return <button type="button" key={id} onClick={() => selectRelated(id)}><span>{entries[id].title}<small>{labels.families[relationship]}</small></span><FiArrowRight aria-hidden="true" /></button>;
                            })}</div>}
                        </div> : <p className="atlas-inspector-empty">{labels.no_selection}</p>}
                    </aside>
                </div>
                <footer className="atlas-footer"><span>{labels.footer}</span><LangAwareLink to="/contact">{labels.contact}<FiArrowUpRight aria-hidden="true" /></LangAwareLink></footer>
            </div>
        </section>
    );
}