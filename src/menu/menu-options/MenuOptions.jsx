import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowUpRight, FiArrowRight, FiPlus, FiMinus } from "react-icons/fi";
import { FaGithub, FaLinkedin, FaYoutube, FaGamepad } from "react-icons/fa";
import { VscTerminal, VscGlobe, VscJson } from "react-icons/vsc";
import l from "@/assets/links/links.json";
import { useLang } from "@/lang/languageContext";
import "./MenuOptions.css";

const destinations = [
	{ key: "home", number: "01", path: l.menu.home },
	{ key: "about", number: "02", path: l.menu.about },
	{ key: "portfolio", number: "03", path: l.menu.portfolio },
	{ key: "projects", number: "04" },
	{ key: "contact", number: "05", path: l.menu.contact },
];

const projects = [
	{ key: "tiger", path: l.menu.tiger, icon: VscTerminal },
	{ key: "snake", path: l.menu.snake, icon: FaGamepad },
	{ key: "portfolio_translator", path: l.menu.languages, icon: VscGlobe },
	{ key: "formatter", path: l.menu.formatter, icon: VscJson },
];

const MenuOptions = ({ handleToggle, closeMenu }) => {
	const { t } = useLang();
	const { pathname } = useLocation();
	const activeProject = projects.some(({ path }) => pathname === path || pathname.startsWith(`${path}/`));
	const current = destinations.find(({ path }) => path === pathname) || destinations[activeProject ? 3 : 0];
	const [selected, setSelected] = useState(current);
	const [showProjects, setShowProjects] = useState(activeProject);
	const dismiss = closeMenu || handleToggle;

	return (
		<div className="atlas-menu">
			<div className="atlas-menu__scenery" aria-hidden="true">
				<div className="atlas-menu__galaxy" style={{ backgroundImage: `url("${process.env.PUBLIC_URL}/assets/images/galaxy-m101.jpg")` }} />
				<div className="atlas-menu__coast" />
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
									<span className="atlas-menu__index">{destination.number}</span>
									<span className="atlas-menu__label">{t(`menu.${destination.key}`)}</span>
									<span className="atlas-menu__link-icon" aria-hidden="true">{isProjects ? (showProjects ? <FiMinus /> : <FiPlus />) : <FiArrowUpRight />}</span>
								</>;
								const linkProps = {
									className: `atlas-menu__destination ${selected.key === destination.key ? "is-selected" : ""} ${isCurrent ? "is-current" : ""}`,
									onMouseEnter: () => setSelected(destination),
									onFocus: () => setSelected(destination),
								};
								return (
									<li className="atlas-menu__entry" key={destination.key} style={{ "--entry-delay": `${index * 55}ms` }}>
										{isProjects ? <button {...linkProps} type="button" aria-expanded={showProjects} aria-controls="menu-projects" onClick={() => setShowProjects((open) => !open)}>{content}</button>
											: <Link {...linkProps} to={destination.path} aria-current={isCurrent ? "page" : undefined} onClick={dismiss}>{content}</Link>}
										{isProjects && showProjects && (
											<ul className="atlas-menu__projects" id="menu-projects">
												{projects.map(({ key, path, icon: Icon }) => <li key={key}>
													<Link to={path} onClick={dismiss} aria-current={pathname === path ? "page" : undefined}>
														<Icon aria-hidden="true" /><span>{t(`menu.${key}`)}</span><FiArrowUpRight aria-hidden="true" />
													</Link>
												</li>)}
											</ul>
										)}
									</li>
								);
							})}
						</ul>
					</nav>
					<aside className="atlas-menu__preview" aria-label="Destination preview">
						<div className="atlas-menu__preview-top"><span>PG / INDEX</span><span>{selected.number} <span className="atlas-menu__muted">/ 05</span></span></div>
						<div className="atlas-menu__preview-body" key={selected.key}>
							<span className="atlas-menu__coordinate" aria-hidden="true">{selected.number}</span>
							<div className="atlas-menu__preview-copy">
								<span className="atlas-menu__route">{selected.path || "/projects"}</span>
								<h2>{t(`menu.${selected.key}`)}</h2>
								<p>{t(`menu.${selected.key}_description`)}</p>
								{selected.path ? <Link to={selected.path} className="atlas-menu__preview-link" onClick={dismiss} aria-label={t(`menu.${selected.key}`)}><FiArrowRight aria-hidden="true" /></Link>
									: <div className="atlas-menu__project-count"><span>04</span> React / WebAssembly / Python</div>}
							</div>
						</div>
						<div className="atlas-menu__signature"><span>React / TypeScript / .NET</span><span>Java / Python / Node.js</span></div>
					</aside>
				</div>
				<footer className="atlas-menu__footer">
					<span className="atlas-menu__copyright">Patrick Goodwin <span>/ {new Date().getFullYear()}</span></span>
					<div className="atlas-menu__socials">
						{[{ name: "GitHub", key: "github", icon: FaGithub }, { name: "LinkedIn", key: "linkedin", icon: FaLinkedin }, { name: "YouTube", key: "youtube", icon: FaYoutube }].map(({ name, key, icon: Icon }) => (
							<a key={key} href={l.social_media[key]} target="_blank" rel="noopener noreferrer" title={`${name} (opens in a new tab)`}><Icon aria-hidden="true" /><span>{name}</span><FiArrowUpRight aria-hidden="true" /></a>
						))}
					</div>
				</footer>
			</div>
		</div>
	);
};

export default MenuOptions;
