import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowDown, FiArrowUpRight, FiBookOpen, FiBriefcase, FiSearch, FiX } from "react-icons/fi";
import { getLanguageTag, useLang } from "@/lang/languageContext";
import LangAwareLink from "@/components/lang-aware-link/LangAwareLink";
import "./LinkedSkillsTable.css";

const EXPERIENCE_GROUPS = ["professional_experience", "educational_experience"];
const MAX_RELATED = 8;
const MAX_SUMMARY_PROJECTS = 3;
const MAX_VARIANTS = 8;

const variantLabel = (label) => {
	const match = label.match(/\(([^)]+)\)\s*$/);
	return match ? match[1] : label;
};

const experienceLabel = (label) => label.split(":").slice(1).join(":").trim() || label;

const ProjectCard = ({ samples, entry, onResize, t }) => {
	const [expanded, setExpanded] = useState(false);
	const title = (entry && entry.title) || variantLabel(samples[0].label);
	const single = samples.length === 1;
	const hidden = samples.length - MAX_VARIANTS;
	const visible = expanded || hidden <= 0 ? samples : samples.slice(0, MAX_VARIANTS);

	const toggle = () => {
		setExpanded((value) => !value);
		window.requestAnimationFrame(onResize);
	};

	return (
		<li className="skill-project-card">
			<div className="skill-project-card__title">
				<LangAwareLink to={single ? samples[0].link : (entry && entry.link) || samples[0].link}>
					{title}<FiArrowUpRight aria-hidden="true" />
				</LangAwareLink>
			</div>
			{entry && entry.text && <p>{entry.text}</p>}
			{!single && (
				<div className="skill-project-card__variants">
					{visible.map((sample) => (
						<LangAwareLink key={sample.label} to={sample.link}>{variantLabel(sample.label)}</LangAwareLink>
					))}
					{hidden > 0 && (
						<button type="button" className="skill-project-card__more" onClick={toggle} aria-expanded={expanded}>
							{expanded ? t("about.technical_skills.show_less") : `+${hidden} ${t("about.technical_skills.and_more")}`}
						</button>
					)}
				</div>
			)}
		</li>
	);
};

const LinkedSkillsTable = ({ id, header, list, projects, entries = {}, skillNames = {} }) => {
	const { t, lang } = useLang();
	const location = useLocation();
	const navigate = useNavigate();
	const sectionRef = useRef(null);
	const listRef = useRef(null);
	const tabRefs = useRef({});
	const projectsRef = useRef(null);
	const [projectsHaveMore, setProjectsHaveMore] = useState(false);
	const [query, setQuery] = useState("");

	const sortedList = useMemo(() => list
		.map((skill) => {
			const seen = new Set();
			const samples = projects.filter((project) => {
				if (!project.skills.includes(skill.id) || seen.has(project.label)) return false;
				seen.add(project.label);
				return true;
			});
			return { ...skill, samples };
		})
		.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true })), [list, projects]);

	const [selectedId, setSelectedId] = useState(() => sortedList[0] && sortedList[0].id);
	const selected = sortedList.find((skill) => skill.id === selectedId) || sortedList[0];

	const filtered = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return sortedList;
		return sortedList.filter((skill) => skill.name.toLowerCase().includes(needle) || skill.id.includes(needle));
	}, [query, sortedList]);

	const detail = useMemo(() => {
		if (!selected) return null;
		const experience = selected.samples.filter((sample) => EXPERIENCE_GROUPS.includes(sample.group));
		const groups = new Map();
		selected.samples
			.filter((sample) => !EXPERIENCE_GROUPS.includes(sample.group))
			.forEach((sample) => {
				if (!groups.has(sample.group)) groups.set(sample.group, []);
				groups.get(sample.group).push(sample);
			});

		// Count related skills once per project family so large families don't dominate.
		const related = new Map();
		[...groups.values(), ...experience.map((sample) => [sample])].forEach((samples) => {
			const ids = new Set(samples.flatMap((sample) => sample.skills));
			ids.forEach((skillId) => {
				if (skillId !== selected.id && skillNames[skillId]) related.set(skillId, (related.get(skillId) || 0) + 1);
			});
		});

		return {
			experience,
			projectGroups: [...groups.entries()].map(([group, samples]) => ({ group, samples, entry: entries[group] })),
			related: [...related.entries()]
				.sort((a, b) => b[1] - a[1] || skillNames[a[0]].localeCompare(skillNames[b[0]]))
				.slice(0, MAX_RELATED)
				.map(([skillId]) => skillId),
		};
	}, [selected, entries, skillNames]);

	const listFormat = useMemo(() => {
		try {
			return new Intl.ListFormat(getLanguageTag(lang || "en_us"), { style: "long", type: "conjunction" });
		} catch (error) {
			return null;
		}
	}, [lang]);

	const summary = useMemo(() => {
		if (!detail) return [];
		const formatItems = (items, limit = Infinity) => {
			const shown = items.length > limit ? [...items.slice(0, limit), t("about.technical_skills.and_more")] : items;
			return listFormat ? listFormat.format(shown) : shown.join(", ");
		};
		const fill = (key, items, limit) => t(`about.technical_skills.${key}`).replace("{items}", formatItems(items, limit));
		const byGroup = (group) => detail.experience.filter((sample) => sample.group === group).map((sample) => experienceLabel(sample.label));
		const professional = byGroup("professional_experience");
		const education = byGroup("educational_experience");
		const projectTitles = detail.projectGroups.map(({ samples, entry }) => (entry && entry.title) || variantLabel(samples[0].label));

		const sentences = [];
		if (professional.length) sentences.push(fill("summary_professional", professional));
		else if (education.length) sentences.push(fill("summary_education", education));
		if (projectTitles.length) sentences.push(fill(sentences.length ? "summary_projects_also" : "summary_projects", projectTitles, MAX_SUMMARY_PROJECTS));
		return sentences;
	}, [detail, listFormat, t]);

	const selectSkill = (skillId, { focus = false } = {}) => {
		setSelectedId(skillId);
		window.history.replaceState(window.history.state, "", `${location.pathname}${location.search}#${skillId}`);
		if (focus) tabRefs.current[skillId] && tabRefs.current[skillId].focus();
	};

	const selectRelated = (skillId) => {
		if (sortedList.some((skill) => skill.id === skillId)) {
			setQuery("");
			selectSkill(skillId);
		} else {
			navigate({ pathname: location.pathname, search: location.search, hash: `#${skillId}` }, { replace: true });
		}
	};

	useEffect(() => {
		const hash = decodeURIComponent(location.hash.replace("#", ""));
		if (!hash || !sortedList.some((skill) => skill.id === hash)) return undefined;
		setSelectedId(hash);
		setQuery("");
		const timeout = setTimeout(() => sectionRef.current && sectionRef.current.scrollIntoView({ behavior: "auto", block: "start" }), 350);
		return () => clearTimeout(timeout);
	}, [location.hash, location.key, sortedList]);

	// Keep the active skill visible inside the list without moving the page.
	useEffect(() => {
		const container = listRef.current;
		const tab = selected && tabRefs.current[selected.id];
		if (!container || !tab) return;
		const top = tab.offsetTop;
		const bottom = top + tab.offsetHeight;
		if (top < container.scrollTop) container.scrollTop = top;
		else if (bottom > container.scrollTop + container.clientHeight) container.scrollTop = bottom - container.clientHeight;
	}, [selected, filtered]);

	// On mobile the projects list is height-capped; fade the bottom edge while more cards are hidden.
	const updateProjectsOverflow = useCallback(() => {
		const el = projectsRef.current;
		setProjectsHaveMore(!!el && el.scrollHeight - el.scrollTop - el.clientHeight > 4);
	}, []);

	useEffect(() => {
		const el = projectsRef.current;
		if (el) el.scrollTop = 0;
		updateProjectsOverflow();
		window.addEventListener("resize", updateProjectsOverflow);
		return () => window.removeEventListener("resize", updateProjectsOverflow);
	}, [selected, updateProjectsOverflow]);

	const moveSelection = (event) => {
		if (!filtered.length) return;
		const index = filtered.findIndex((skill) => skill.id === (selected && selected.id));
		const last = filtered.length - 1;
		const next = {
			ArrowDown: index < 0 ? 0 : Math.min(index + 1, last),
			ArrowUp: index < 0 ? last : Math.max(index - 1, 0),
			Home: 0,
			End: last,
		}[event.key];
		if (next === undefined) return;
		event.preventDefault();
		selectSkill(filtered[next].id, { focus: true });
	};

	const onSearchKeyDown = (event) => {
		if (event.key === "Enter" && filtered.length) {
			event.preventDefault();
			selectSkill(filtered[0].id);
		} else if (event.key === "Escape" && query) {
			setQuery("");
		} else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			const index = filtered.findIndex((skill) => skill.id === (selected && selected.id));
			const target = filtered[index < 0 ? 0 : index];
			if (target) selectSkill(target.id, { focus: true });
		}
	};

	if (!selected) return null;

	const panelId = `${id}-panel`;
	const familyCount = detail.projectGroups.length;

	return (
		<section className="skill-explorer" ref={sectionRef} aria-labelledby={`${id}-title`}>
			<header className="skill-explorer__heading">
				<h3 id={`${id}-title`}>{header}</h3>
				<span>{sortedList.length} {t("about.technical_skills.technologies")}</span>
			</header>

			<div className="skill-explorer__body">
				<div className="skill-explorer__index">
					<div className="skill-search">
						<FiSearch aria-hidden="true" />
						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							onKeyDown={onSearchKeyDown}
							placeholder={t("about.technical_skills.search_placeholder")}
							aria-label={`${t("about.technical_skills.search_label")} ${header}`}
							autoComplete="off"
							spellCheck="false"
						/>
						{query && (
							<button type="button" onClick={() => setQuery("")} aria-label={t("about.technical_skills.clear_search")}>
								<FiX aria-hidden="true" />
							</button>
						)}
					</div>
					<span className="visually-hidden" aria-live="polite">{query ? `${filtered.length} / ${sortedList.length}` : ""}</span>
					<div className="skill-index__list" ref={listRef} role="tablist" aria-orientation="vertical" aria-label={header} onKeyDown={moveSelection}>
						{filtered.length ? filtered.map((skill) => {
							const isActive = skill.id === selected.id;
							return (
								<button
									key={skill.id}
									type="button"
									role="tab"
									id={`${id}-tab-${skill.id}`}
									ref={(el) => { tabRefs.current[skill.id] = el; }}
									className={`skill-index__item${isActive ? " is-active" : ""}`}
									aria-selected={isActive}
									aria-controls={panelId}
									tabIndex={isActive ? 0 : -1}
									onClick={() => selectSkill(skill.id)}
								>
									<span className="skill-index__name">{skill.name}</span>
								</button>
							);
						}) : <p className="skill-index__empty">{t("about.technical_skills.no_matches")}</p>}
					</div>
				</div>

				<article className="skill-detail" id={panelId} role="tabpanel" aria-labelledby={`${id}-tab-${selected.id}`} aria-live="polite" key={selected.id}>
					<header className="skill-detail__header">
						<span className="skill-detail__eyebrow">{header}</span>
						<h4>{selected.name}</h4>
						{summary.length > 0 ? (
							<p className="skill-detail__summary">{summary.join(" ")}</p>
						) : (
							<p className="skill-detail__summary">
								{t("about.technical_skills.no_samples")} <LangAwareLink to="/contact">{t("home.atlas.contact")}<FiArrowUpRight aria-hidden="true" /></LangAwareLink>
							</p>
						)}
					</header>

					{detail.experience.length > 0 && (
						<section className="skill-detail__section">
							<h5>{t("about.technical_skills.experience")}</h5>
							<ul className="skill-experience">
								{detail.experience.map((sample) => {
									const isEducation = sample.group === "educational_experience";
									return (
										<li key={sample.label}>
											<LangAwareLink to={sample.link}>
												{isEducation ? <FiBookOpen aria-hidden="true" /> : <FiBriefcase aria-hidden="true" />}
												<span>{experienceLabel(sample.label)}</span>
												<em>{t(`about.technical_skills.${isEducation ? "education" : "professional"}`)}</em>
												<FiArrowUpRight aria-hidden="true" />
											</LangAwareLink>
										</li>
									);
								})}
							</ul>
						</section>
					)}

					{familyCount > 0 && (
						<section className="skill-detail__section">
							<h5>{t("about.technical_skills.works")}</h5>
							<ul className={`skill-projects-grid${projectsHaveMore ? " has-more" : ""}`} ref={projectsRef} onScroll={updateProjectsOverflow}>
								{detail.projectGroups.map(({ group, samples, entry }) => (
									<ProjectCard key={group} samples={samples} entry={entry} onResize={updateProjectsOverflow} t={t} />
								))}
							</ul>
							{projectsHaveMore && <p className="skill-projects-hint" aria-hidden="true">{t("about.technical_skills.scroll_more")}<FiArrowDown /></p>}
						</section>
					)}

					{detail.related.length > 0 && (
						<section className="skill-detail__section">
							<h5>{t("about.technical_skills.paired_with")}</h5>
							<div className="skill-related">
								{detail.related.map((skillId) => (
									<button key={skillId} type="button" onClick={() => selectRelated(skillId)}>{skillNames[skillId]}</button>
								))}
							</div>
						</section>
					)}
				</article>
			</div>
		</section>
	);
};

export default LinkedSkillsTable;
