import React from "react";
import { FiBriefcase } from "react-icons/fi";
import "./WorkHistoryTable.css";

const WorkHistoryTable = ({ entries }) => {
	return (
		<div className="career-timeline">
			{entries.map((entry) => (
				<article className="career-entry" key={`${entry.where}-${entry.date}`}>
					<div className="career-marker"><FiBriefcase /></div>
					<div className="career-date">{entry.date}</div>
					<div className="career-details">
						<h3>{entry.jobtitle}</h3>
						<p>{entry.where}</p>
					</div>
				</article>
			))}
		</div>
	);
};

export default WorkHistoryTable;
