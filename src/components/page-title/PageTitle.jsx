import React from "react";
import { Row, Col } from "react-bootstrap";
import "./PageTitle.css";

const PageTitle = ({ title }) => {
	return (
		<Row className="mb-5 mt-3 pt-md-3">
			<Col lg="8">
				<h1 className="display-4 mb-4">
					{title}
				</h1>
				<hr className="t_border my-4 ml-0 text-left" />
			</Col>
		</Row>
	);
};

export default PageTitle;