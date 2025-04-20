import React, { useState } from "react";
import { Table, Collapse } from "react-bootstrap";
import "./LinkedSkillsTable.css";

const LinkedSkillsTable = ({ header, list, projects }) => {
	const [openRows, setOpenRows] = useState({});

	const toggleRow = (index) => {
		setOpenRows(prev => {
			const newState = { ...prev };
			newState[index] = !prev[index];
			return newState;
		});
	};

	// Attach matching projects to each skill
	const enrichedList = list.map(skill => {
		const matchingProjects = projects.filter(project =>
			project.skills.includes(skill.id)
		);
		return {
			...skill,
			code_samples: matchingProjects,
		};
	});

	// Sort: first by number of samples, then alphabetically
	const sortedList = enrichedList.sort((a, b) => {
		const aCount = a.code_samples.length;
		const bCount = b.code_samples.length;
		if (bCount !== aCount) return bCount - aCount;
		return a.name.localeCompare(b.name);
	});

	return (
		<>
			<h4 className="color_sec py-3">{header}</h4>
			<Table hover bordered>
				<thead>
					<tr>
						<th>{header}</th>
						<th style={{ width: "50px" }}></th>
					</tr>
				</thead>
				<tbody>
					{sortedList.map((item, i) => {
						const isOpen = !!openRows[i];
						return (
							<React.Fragment key={i}>
								<tr onClick={() => toggleRow(i)} className="clickable-row">
									<td>
										{item.name}
										{item.code_samples.length ? ` (${item.code_samples.length})` : ""}
									</td>
									<td className="text-center arrow-toggle" style={{ fontSize: "1.25rem" }}>
										{isOpen ? "▲" : "▼"}
									</td>
								</tr>
								<tr>
									<td colSpan="2" className="p-0">
										<Collapse in={isOpen}>
											<div className="p-3 bg-dark text-white">
												{item.code_samples.map((sample, j) => (
													<div key={j} className="mb-2">
														<a
															className="skills link framework"
															href={sample.link}
															target="_blank"
															rel="noopener noreferrer"
														>
															{sample.label}
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
