import React, { useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import {
	DropdownButton,
	Dropdown,
	FormControl
} from "react-bootstrap";
import { FiArrowUpRight, FiCheck, FiFilter, FiGrid, FiList, FiSearch, FiX } from "react-icons/fi";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import links from "@/assets/links/links.json";
import skills from "@/assets/skills/skills.json";
import projectsData from "@/assets/projects/projects.json";
import { useLocation, useNavigate } from "react-router-dom";
import LangAwareLink from "@/components/lang-aware-link/LangAwareLink";
import { readSkillSelection, writeSkillSelection, collectGroupSkills, matchesSkills } from "./portfolioFilters";
import "./PortfolioArchive.css";

const allSkills = [...skills.languages, ...skills.frameworks, ...skills.other_technologies];
const skillNames = Object.fromEntries(allSkills.map((skill) => [skill.id, skill.name]));
const groupToSkillsMap = collectGroupSkills(projectsData.projects);
const featuredOrder = ["takeoff_engine", "inventory_register", "grocery_app", "tiger_programming_language", "payrollobol", "formatter", "interop"];

const Portfolio = () => {
	const { t } = useLang();
	const entries = t("portfolio.entries");
	const images = links.portfolio;
	const location = useLocation();
	const navigate = useNavigate();
	const selectedSkills = readSkillSelection(location.search, location.hash);
	const [projectQuery, setProjectQuery] = useState("");
	const [view, setView] = useState("grid");
	const [sort, setSort] = useState("featured");

	// search terms for each dropdown
	const [searchTerm, setSearchTerm] = useState({
		languages: "",
		frameworks: "",
		other_technologies: ""
	});

	const resolveImage = (filename) => {
		return `/assets/images/${filename}`;
	};

	const updateURL = (updated) => {
		navigate({ pathname: location.pathname, search: writeSkillSelection(location.search, updated), hash: "" }, { replace: true, preventScrollReset: true });
	};

	const handleSkillSelect = (skillId) => {
		updateURL(selectedSkills.includes(skillId)
			? selectedSkills.filter((id) => id !== skillId)
			: [...selectedSkills, skillId]);
	};

	const resetFilters = () => { setProjectQuery(""); updateURL([]); };

	const renderDropdown = (title, skillList, keyName) => {
		const term = searchTerm[keyName].toLowerCase();
		const filtered = skillList.filter((s) =>
			s.name.toLowerCase().includes(term)
		);

		const selectedCount = skillList.filter((s) => selectedSkills.includes(s.id)).length;
		const dynamicTitle = selectedCount ? `${title} (${selectedCount})` : title;

		return (
			<DropdownButton
				key={keyName}
				id={`dropdown-${keyName}`}
				title={dynamicTitle}
				variant="outline-secondary"
				className="filter-dropdown"
				autoClose="outside"
				renderMenuOnMount
			>
				<FormControl
					placeholder={`Search ${title}…`}
					aria-label={`Search ${title}`}
					className="dropdown-search"
					value={searchTerm[keyName]}
					onChange={(e) =>
						setSearchTerm((prev) => ({
							...prev,
							[keyName]: e.target.value
						}))
					}
				/>
				<Dropdown.Divider />
				{filtered.map((skill) => (
					<Dropdown.Item
						key={skill.id}
						active={selectedSkills.includes(skill.id)}
						as="button"
						aria-pressed={selectedSkills.includes(skill.id)}
						onClick={() => handleSkillSelect(skill.id)}
					>
						<span>{skill.name}</span>{selectedSkills.includes(skill.id) && <FiCheck />}
					</Dropdown.Item>
				))}
				{filtered.length === 0 && <div className="dropdown-no-results">{t("home.atlas.no_results")}</div>}
			</DropdownButton>
		);
	};

	const visibleEntries = Object.entries(entries)
		.filter(([key, data]) => {
			const technologyText = [...(groupToSkillsMap[key] || [])].map((id) => skillNames[id] || id).join(" ");
			return matchesSkills(groupToSkillsMap[key], selectedSkills)
				&& `${data.title} ${data.text} ${technologyText}`.toLowerCase().includes(projectQuery.trim().toLowerCase());
		})
		.sort(([firstKey, first], [secondKey, second]) => {
			if (sort === "featured") {
				const firstRank = featuredOrder.includes(firstKey) ? featuredOrder.indexOf(firstKey) : featuredOrder.length;
				const secondRank = featuredOrder.includes(secondKey) ? featuredOrder.indexOf(secondKey) : featuredOrder.length;
				if (firstRank !== secondRank) return firstRank - secondRank;
			}
			return first.title.localeCompare(second.title);
		});

	const getProjectSkills = (group) => {
		return [...(groupToSkillsMap[group] || [])].filter((id) => skillNames[id])
			.sort((first, second) => Number(selectedSkills.includes(second)) - Number(selectedSkills.includes(first)))
			.slice(0, 6);
	};

	return (
		<HelmetProvider>
			<main className="portfolio-page">
				<Tab title={t("portfolio.title")} />
				<header className="portfolio-hero">
					<div className="portfolio-kicker"><span>{t("name")}</span><span>{t("home.atlas.projects")} / {String(Object.keys(entries).length).padStart(2, "0")}</span></div>
					<div className="portfolio-title-row">
						<h1>{t("portfolio.title")}<span>.</span></h1>
						<p>{t("home.atlas.footer")}</p>
					</div>
				</header>

				<section className="portfolio-browser" aria-label={t("portfolio.title")}>
					<div className="portfolio-toolbar">
						<label className="portfolio-search"><FiSearch /><input type="search" value={projectQuery} onChange={(event) => setProjectQuery(event.target.value)} placeholder={t("home.atlas.search")} aria-label={t("home.atlas.search")} /></label>
						<div className="dropdown-wrap-container">
							{renderDropdown(t("about.technical_skills.header1"), skills.languages, "languages")}
							{renderDropdown(t("about.technical_skills.header2"), skills.frameworks, "frameworks")}
							{renderDropdown(t("about.technical_skills.header3"), skills.other_technologies, "other_technologies")}
						</div>
					</div>

					{selectedSkills.length > 0 && (
						<div className="active-filters">
							{selectedSkills.map((skillId) => (
								<button key={skillId} type="button" onClick={() => handleSkillSelect(skillId)}>
									{skillNames[skillId] || skillId}<FiX />
								</button>
							))}
							<button type="button" className="clear-filters" onClick={resetFilters}>{t("home.atlas.reset")}</button>
						</div>
					)}

					<div className="portfolio-results-line">
						<span aria-live="polite" aria-atomic="true"><strong>{String(visibleEntries.length).padStart(2, "0")}</strong> / {String(Object.keys(entries).length).padStart(2, "0")} {t("home.atlas.projects")}</span>
						<div className="portfolio-view-tools">
							<select aria-label="Sort projects" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">{t("home.featured.title")}</option><option value="alphabetical">A - Z</option></select>
							<div className="portfolio-view-switch" role="group" aria-label="Project view">
								<button type="button" aria-label="Grid view" title="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")}><FiGrid /></button>
								<button type="button" aria-label="List view" title="List view" aria-pressed={view === "list"} onClick={() => setView("list")}><FiList /></button>
							</div>
						</div>
					</div>

					<div className={`portfolio-grid portfolio-view-${view}`}>
					{visibleEntries.map(([key, data], index) => {
						const projectSkills = getProjectSkills(key);
						return (
						<article className={`portfolio-project ${index === 0 && sort === "featured" ? "project-featured" : ""}`} key={key} data-project={key}>
							<a
								href={data.link}
								target="_blank"
								rel="noopener noreferrer"
								className="project-image-wrap"
								aria-label={`${t("home.featured.view_project")}: ${data.title}`}
							>
									<img
										src={resolveImage(images[key] || images.default)}
										alt={data.title}
										className="portfolio-card-img"
										loading={index < 3 ? "eager" : "lazy"}
										onError={(event) => { if (!event.currentTarget.src.endsWith(images.default)) event.currentTarget.src = resolveImage(images.default); }}
									/>
									<span className="project-index">{String(index + 1).padStart(2, "0")}</span>
									<span className="project-open" aria-hidden="true"><FiArrowUpRight /></span>
							</a>
								<div className="project-body">
									{index === 0 && sort === "featured" && <div className="project-feature-label">{t("home.featured.title")}</div>}
									<h2><a href={data.link} target="_blank" rel="noopener noreferrer">{data.title}</a></h2>
									<p>{data.text}</p>
									{projectSkills.length > 0 && <div className="project-tags">{projectSkills.map((skill) => <LangAwareLink key={skill} className={selectedSkills.includes(skill) ? "is-selected" : ""} to={{ pathname: "/about", search: "?", hash: `#${skill}` }}>#{skillNames[skill]}</LangAwareLink>)}</div>}
								</div>
						</article>
						);
					})}
					</div>

					{visibleEntries.length === 0 && (
						<div className="portfolio-empty"><FiFilter /><h2>{t("home.atlas.no_results")}</h2><button type="button" onClick={resetFilters}>{t("home.atlas.reset")}</button></div>
					)}
				</section>
				<footer className="portfolio-closing"><LangAwareLink to="/about">{t("home.about_button")}<FiArrowUpRight /></LangAwareLink><LangAwareLink to="/contact">{t("home.atlas.contact")}<FiArrowUpRight /></LangAwareLink></footer>
			</main>
		</HelmetProvider>
	);
};

export default Portfolio;
