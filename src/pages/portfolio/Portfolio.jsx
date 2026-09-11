import React, { useState, useMemo } from "react";
import { HelmetProvider } from "react-helmet-async";
import {
	DropdownButton,
	Dropdown,
	FormControl
} from "react-bootstrap";
import { FiArrowUpRight, FiFilter, FiGrid, FiX } from "react-icons/fi";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import links from "@/assets/links/links.json";
import skills from "@/assets/skills/skills.json";
import projectsData from "@/assets/projects/projects.json";
import { useLocation } from "react-router-dom";
import "./Portfolio.css";

const Portfolio = () => {
	const { t } = useLang();
	const entries = t("portfolio.entries");
	const images = links.portfolio;
	const location = useLocation();

	// URL-backed selection state
	const [selectedSkills, setSelectedSkills] = useState(() => {
		const params = new URLSearchParams(location.search);
		const skillString = params.get("skills");
		return skillString ? skillString.split(",") : [];
	});

	// search terms for each dropdown
	const [searchTerm, setSearchTerm] = useState({
		languages: "",
		frameworks: "",
		other_technologies: ""
	});

	const resolveImage = (filename) => {
		return `/assets/images/${filename}`;
	};

	const allSkills = useMemo(
		() => [...skills.languages, ...skills.frameworks, ...skills.other_technologies],
		[]
	);

	const skillNames = useMemo(
		() => Object.fromEntries(allSkills.map((skill) => [skill.id, skill.name])),
		[allSkills]
	);
	
	// Update URL
	const updateURL = (updated) => {
		const params = new URLSearchParams(location.search);
		if (updated.length) params.set("skills", updated.join(","));
		else params.delete("skills");
		window.history.replaceState(null, "", `${location.pathname}?${params}`);
	};

	const handleSkillSelect = (skillId) => {
		setSelectedSkills((prev) => {
			const updated = prev.includes(skillId)
				? prev.filter((id) => id !== skillId)
				: [...prev, skillId];
			updateURL(updated);
			return updated;
		});
	};

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
				renderMenuOnMount
			>
				<FormControl
					autoFocus
					placeholder={`Search ${title}…`}
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
						onClick={() => handleSkillSelect(skill.id)}
					>
						{skill.name}
					</Dropdown.Item>
				))}
			</DropdownButton>
		);
	};

	const groupToSkillsMap = useMemo(() => {
		const map = {};
		projectsData.projects.forEach((p) => {
			map[p.group] ||= new Set();
			p.skills.forEach((s) => map[p.group].add(s));
		});
		return map;
	}, [projectsData]);

	const isProjectVisible = (group) => {
		if (!selectedSkills.length) return true;
		const set = groupToSkillsMap[group] || new Set();
		return selectedSkills.some((s) => set.has(s));
	};

	const visibleEntries = useMemo(() => {
		return Object.entries(entries)
			.filter(([key]) => isProjectVisible(key))
			.sort(([, a], [, b]) => a.title.localeCompare(b.title));
	}, [entries, selectedSkills, groupToSkillsMap]);

	const getProjectSkills = (group) => {
		const project = projectsData.projects.find((item) => item.group === group);
		return project ? project.skills.map((id) => skillNames[id]).filter(Boolean).slice(0, 4) : [];
	};

	return (
		<HelmetProvider>
			<main className="portfolio-page">
				<Tab title={t("portfolio.title")} />
				<header className="portfolio-hero">
					<div className="portfolio-hero-grid" aria-hidden="true"></div>
					<div className="portfolio-kicker"><FiGrid /> PROJECT_ARCHIVE / {String(Object.keys(entries).length).padStart(2, "0")}</div>
					<h1>{t("portfolio.title")}</h1>
					<div className="portfolio-hero-meta">
						<span>FULL STACK</span><i></i><span>WEB</span><i></i><span>LANGUAGES</span><i></i><span>TOOLS</span>
					</div>
				</header>

				<section className="portfolio-browser">
					<div className="portfolio-toolbar">
						<div className="filter-heading">
							<FiFilter />
							<div><span>// FILTER_INDEX</span><h2>{t("portfolio.filter_by")}</h2></div>
						</div>
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
							<button type="button" className="clear-filters" onClick={() => { setSelectedSkills([]); updateURL([]); }}>CLEAR ALL</button>
						</div>
					)}

					<div className="portfolio-results-line">
						<span>SHOWING {String(visibleEntries.length).padStart(2, "0")} / {String(Object.keys(entries).length).padStart(2, "0")}</span>
						<i></i>
					</div>

					<div className="portfolio-grid">
					{visibleEntries.map(([key, data], index) => {
						const projectSkills = getProjectSkills(key);
						return (
						<article className="portfolio-project" key={key}>
							<a
								href={data.link}
								target="_blank"
								rel="noopener noreferrer"
								className="portfolio-project-link"
							>
								<div className="project-image-wrap">
									<img
										src={resolveImage(images[key] || images.default)}
										alt={data.title}
										className="portfolio-card-img"
										onError={(event) => { event.currentTarget.src = resolveImage(images.default); }}
									/>
									<span className="project-index">{String(index + 1).padStart(2, "0")}</span>
									<span className="project-open"><FiArrowUpRight /></span>
								</div>
								<div className="project-body">
									<h2>{data.title}</h2>
									<p>{data.text}</p>
									{projectSkills.length > 0 && <div className="project-tags">{projectSkills.map((skill) => <span key={skill}>{skill}</span>)}</div>}
								</div>
							</a>
						</article>
						);
					})}
					</div>

					{visibleEntries.length === 0 && (
						<div className="portfolio-empty"><FiFilter /><h2>No matching projects</h2><button type="button" onClick={() => { setSelectedSkills([]); updateURL([]); }}>RESET FILTERS</button></div>
					)}
				</section>
			</main>
		</HelmetProvider>
	);
};

export default Portfolio;
