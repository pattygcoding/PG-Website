import React from "react";
import { Table } from "react-bootstrap";
import "./UnlinkedSkillsTable.css";

const UnlinkedSkillsTable = ({ header, list }) => {
	return (
		<>
			<h4 className="color_sec py-3">{header}</h4>
			<Table hover bordered>
				<tbody>
					{list.map((item, index) => (
						<tr key={index}>
							<td>{item}</td>
						</tr>
					))}
				</tbody>
			</Table>
		</>
	);
};

export default UnlinkedSkillsTable;
