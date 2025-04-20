import React from "react";
import { Table } from "react-bootstrap";
import "./WorkHistoryTable.css"; // optional for your custom styles

const WorkHistoryTable = ({ entries }) => {
	return (
		<Table hover bordered className="caption-top">
			<tbody>
				{entries.map((entry, index) => (
					<tr key={index}>
						<th scope="row">{entry.jobtitle}</th>
						<td>{entry.where}</td>
						<td>{entry.date}</td>
					</tr>
				))}
			</tbody>
		</Table>
	);
};

export default WorkHistoryTable;
