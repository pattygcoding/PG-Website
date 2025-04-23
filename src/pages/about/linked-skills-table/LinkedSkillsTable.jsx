import React, { useState, useEffect, useRef, useMemo } from "react";
import { Table, Collapse } from "react-bootstrap";
import { useLocation } from "react-router-dom";
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
		<>
			<h4 className="color_sec py-3">{header}</h4>
			<Table hover bordered>
				<thead>
					<tr>
						<th>{header}</th>
						<th style={{ width: 50 }}></th>
					</tr>
				</thead>
				<tbody>
					{sortedList.map((item, i) => {
						const isOpen = !!openRows[i];
						return (
							<React.Fragment key={item.id}>
								<tr
									id={item.id}
									ref={el => (skillRefs.current[item.id] = el)}
									onClick={() => toggleRow(i, item.id)}
									className="clickable-row"
								>
									<td>
										{item.name}
										{item.code_samples.length > 0 && ` (${item.code_samples.length})`}
									</td>
									<td className="text-center arrow-toggle" style={{ fontSize: "1.25rem" }}>
										{isOpen ? "▲" : "▼"}
									</td>
								</tr>
								<tr>
									<td colSpan={2} className="p-0">
										<Collapse in={isOpen}>
											<div className="p-3 bg-dark text-white">
												{item.code_samples.map((s, j) => (
													<div key={j} className="mb-2">
														<a
															className="skills link framework"
															href={s.link}
															target="_blank"
															rel="noopener noreferrer"
														>
															{s.label}
														</a>
													</div>
												))}
											</div>
										</Collapse>
									</td>
								</tr>
							</React.Fragment>
						);
					})}
				</tbody>
			</Table>
		</>
	);
};

export default LinkedSkillsTable;
