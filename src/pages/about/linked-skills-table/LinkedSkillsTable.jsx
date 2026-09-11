import React, { useState, useEffect, useRef, useMemo } from "react";
import { Collapse } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { FiArrowUpRight, FiChevronDown } from "react-icons/fi";
import "./LinkedSkillsTable.css";

const LinkedSkillsTable = ({ header, list, projects }) => {
	const [openRows, setOpenRows] = useState({});
	const skillRefs = useRef({});
	const location = useLocation();
	const currentHashRef = useRef(null);

	// Enrich & sort once
	const sortedList = useMemo(() => {
		return list
			.map(skill => ({
				...skill,
				code_samples: projects.filter(p => p.skills.includes(skill.id)),
			}))
			.sort((a, b) => {
				const diff = b.code_samples.length - a.code_samples.length;
				return diff !== 0 ? diff : a.name.localeCompare(b.name);
			});
	}, [list, projects]);

	// Toggle open/closed + update hash without triggering scroll
	const toggleRow = (index, skillId) => {
		// save current scroll
		const { scrollX, scrollY } = window;
		const isOpen = !!openRows[index];

		if (isOpen) {
			// collapse
			window.history.replaceState(null, "", location.pathname);
			setOpenRows({});
			currentHashRef.current = null;
		} else {
			// expand
			window.history.replaceState(null, "", `${location.pathname}#${skillId}`);
			setOpenRows({ [index]: true });
			currentHashRef.current = skillId;
		}

		// immediately restore scroll
		window.scrollTo(scrollX, scrollY);
	};

	// On initial load or when URL hash changes: open that row & scroll once
	useEffect(() => {
		const hash = location.hash.replace("#", "");
		if (!hash) return;

		const idx = sortedList.findIndex(s => s.id === hash);
		if (idx === -1) return;

		setOpenRows({ [idx]: true });
		currentHashRef.current = hash;

		if (!window.__hasScrolledToHash) {
			setTimeout(() => {
				const el = skillRefs.current[hash];
				if (el) {
					el.scrollIntoView({ behavior: "smooth", block: "center" });
				}
				window.__hasScrolledToHash = true;
			}, 100);
		}
	}, [location.hash, sortedList]);

	return (
		<section className="skill-group">
			<header className="skill-group-heading">
				<h3>{header}</h3>
				<span>{String(sortedList.length).padStart(2, "0")} TECHNOLOGIES</span>
			</header>
			<div className="skill-matrix">
					{sortedList.map((item, i) => {
						const isOpen = !!openRows[i];
						return (
							<article
								className={`skill-module ${isOpen ? "is-open" : ""} ${item.code_samples.length ? "has-samples" : ""}`}
								key={item.id}
								id={item.id}
								ref={el => (skillRefs.current[item.id] = el)}
							>
								<button
									type="button"
									onClick={() => toggleRow(i, item.id)}
									aria-expanded={isOpen}
									aria-controls={`${item.id}-projects`}
								>
									<span className="skill-name">{item.name}</span>
									<span className="skill-evidence">
										{item.code_samples.length > 0 ? `${item.code_samples.length} WORK${item.code_samples.length === 1 ? "" : "S"}` : "EXP"}
									</span>
									<FiChevronDown className="skill-chevron" />
								</button>
								<Collapse in={isOpen}>
									<div id={`${item.id}-projects`} className="skill-projects">
										{item.code_samples.length > 0 ? (
											item.code_samples.map((s, j) => (
													<a
														key={j}
														className="skill-project-link"
														href={s.link}
														target="_blank"
														rel="noopener noreferrer"
													>
														<span>{s.label}</span><FiArrowUpRight />
													</a>
												))
											) : (
												<span className="skill-no-projects">Experience listed; project sample not published.</span>
											)}
										</div>
										</Collapse>
							</article>
						);
					})}
			</div>
		</section>
	);
};

export default LinkedSkillsTable;
