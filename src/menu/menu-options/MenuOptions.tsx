import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowUpRight, FiArrowRight, FiPlus, FiMinus } from "react-icons/fi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import l from "@/assets/links/links.json";
import { useLang } from "@/lang/languageContext";
import { projects } from "../projectCatalog";
import type { ProjectCatalogEntry } from "../projectCatalog";
import type { CssVariables } from "@/types/css";
import "./MenuOptions.css";

interface Destination {
	key: string;
	path?: string;
}

const destinations: Destination[] = [
	{ key: "home", path: l.menu.home },
	{ key: "about", path: l.menu.about },
	{ key: "portfolio", path: l.menu.portfolio },
	{ key: "projects" },
	{ key: "contact", path: l.menu.contact },
];

interface MenuOptionsProps {
	handleToggle?: () => void;
	closeMenu?: () => void;
}

const MenuOptions = ({ handleToggle, closeMenu }: MenuOptionsProps) => {
	const { t } = useLang();
	const { pathname } = useLocation();
	const activeProject = projects.some(({ path }) => pathname === path || pathname.startsWith(`${path}/`));
	const current = destinations.find(({ path }) => path === pathname) || destinations[activeProject ? 3 : 0];
	const [selected, setSelected] = useState(current);
	const [showProjects, setShowProjects] = useState(activeProject);
	const dismiss = closeMenu || handleToggle;
	// Groups start truncated (collapsed) and expand on demand.
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
	const toggleGroup = (key: string) => setExpandedGroups((groups) => ({ ...groups, [key]: !groups[key] }));
	const projectLink = ({ key, path, icon: Icon, external }: ProjectCatalogEntry) => external
		? <a href={path} target="_blank" rel="noopener noreferrer" onClick={dismiss} title={`${t(`menu.${key}`)} (opens in a new tab)`}>
			<Icon aria-hidden="true" /><span>{t(`menu.${key}`)}</span><FiArrowUpRight aria-hidden="true" />
		</a>
		: <Link to={path} onClick={dismiss} aria-current={pathname === path ? "page" : undefined}>
			<Icon aria-hidden="true" /><span>{t(`menu.${key}`)}</span><FiArrowUpRight aria-hidden="true" />
		</Link>;

	return (
		<div className="atlas-menu">
			<div className="atlas-menu__scenery" aria-hidden="true">
				<div className="atlas-menu__galaxy" style={{ backgroundImage: `url("${import.meta.env.BASE_URL}assets/images/galaxy-m101.jpg")` }} />
				<div className="atlas-menu__coast" style={{ "--coast-texture": `url("${import.meta.env.BASE_URL}assets/images/white_background.jpg")` } as CssVariables} />
			</div>
			<div className="atlas-menu__content">
				<div className="atlas-menu__masthead">
					<div><span className="atlas-menu__eyebrow">Patrick Goodwin</span><span className="atlas-menu__profession">Senior Software Engineer</span></div>
					<span className="atlas-menu__location">Orlando, FL <span aria-hidden="true">/</span> Remote</span>
				</div>
				<div className="atlas-menu__layout">
					<nav className="atlas-menu__navigation" aria-label="Main navigation">
						<ul className="atlas-menu__destinations">
							{destinations.map((destination, index) => {
								const isProjects = destination.key === "projects";
								const isCurrent = current.key === destination.key;
								const content = <>
									<span className="atlas-menu__label">{t(`menu.${destination.key}`)}</span>
									<span className="atlas-menu__link-icon" aria-hidden="true">{isProjects ? (showProjects ? <FiMinus /> : <FiPlus />) : <FiArrowUpRight />}</span>
								</>;
								const linkProps = {
									className: `atlas-menu__destination ${selected.key === destination.key ? "is-selected" : ""} ${isCurrent ? "is-current" : ""}`,
									onMouseEnter: () => setSelected(destination),
									onFocus: () => setSelected(destination),
								};
								return (
									<li className="atlas-menu__entry" key={destination.key} style={{ "--entry-delay": `${index * 55}ms` } as CssVariables}>
										{isProjects ? <button {...linkProps} type="button" aria-expanded={showProjects} aria-controls="menu-projects" onClick={() => setShowProjects((open) => !open)}>{content}</button>
											: <Link {...linkProps} to={destination.path ?? "/"} aria-current={isCurrent ? "page" : undefined} onClick={dismiss}>{content}</Link>}
										{isProjects && showProjects && (
											<ul className="atlas-menu__projects" id="menu-projects">
												{projects.map(({ key, path, icon: Icon, external, children }) => <li key={key} className={children ? "atlas-menu__project--group" : undefined}>
													{external
														? <a href={path} target="_blank" rel="noopener noreferrer" onClick={dismiss} title={`${t(`menu.${key}`)} (opens in a new tab)`}>
															<Icon aria-hidden="true" /><span>{t(`menu.${key}`)}</span><FiArrowUpRight aria-hidden="true" />
														</a>
														: <Link to={path} onClick={dismiss} aria-current={pathname === path ? "page" : undefined}>
															<Icon aria-hidden="true" /><span>{t(`menu.${key}`)}</span><FiArrowUpRight aria-hidden="true" />
														</Link>}
													{children && <>
														<button type="button" className="atlas-menu__project-toggle" aria-expanded={Boolean(expandedGroups[key])} aria-controls={`menu-project-${key}`} aria-label={`${expandedGroups[key] ? "Collapse" : "Expand"} ${t(`menu.${key}`)}`} title={`${expandedGroups[key] ? "Collapse" : "Expand"} ${t(`menu.${key}`)}`} onClick={() => toggleGroup(key)}>
															{expandedGroups[key] ? <FiMinus aria-hidden="true" /> : <FiPlus aria-hidden="true" />}
														</button>
														{expandedGroups[key] && (
															<ul className="atlas-menu__subprojects" id={`menu-project-${key}`}>
																{children.map((child) => <li key={child.key}>{projectLink(child)}</li>)}
															</ul>
														)}
													</>}
												</li>)}
											</ul>
										)}
									</li>
								);
							})}
						</ul>
					</nav>
					<aside className="atlas-menu__preview" aria-label="Destination preview">
						<div className="atlas-menu__preview-top"><span>PG / INDEX</span></div>
						<div className="atlas-menu__preview-body" key={selected.key}>
							<div className="atlas-menu__preview-copy">
								<span className="atlas-menu__route">{selected.path || "/projects"}</span>
								<h2>{t(`menu.${selected.key}`)}</h2>
								<p>{t(`menu.${selected.key}_description`)}</p>
								{selected.path ? <Link to={selected.path} className="atlas-menu__preview-link" onClick={dismiss} aria-label={t(`menu.${selected.key}`)}><FiArrowRight aria-hidden="true" /></Link>
									: <div className="atlas-menu__project-count">React / WebAssembly / Python</div>}
							</div>
						</div>
						<div className="atlas-menu__signature"><span>React / TypeScript / .NET</span><span>Java / Python / Node.js</span></div>
					</aside>
				</div>
				<footer className="atlas-menu__footer">
					<span className="atlas-menu__copyright">Patrick Goodwin <span>/ {new Date().getFullYear()}</span></span>
					<div className="atlas-menu__socials">
						{[{ name: "GitHub", key: "github" as const, icon: FaGithub }, { name: "LinkedIn", key: "linkedin" as const, icon: FaLinkedin }].map(({ name, key, icon: Icon }) => (
							<a key={key} href={l.social_media[key]} target="_blank" rel="noopener noreferrer" title={`${name} (opens in a new tab)`}><Icon aria-hidden="true" /><span>{name}</span><FiArrowUpRight aria-hidden="true" /></a>
						))}
					</div>
				</footer>
			</div>
		</div>
	);
};

export default MenuOptions;
