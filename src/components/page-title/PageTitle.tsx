import React from "react";
import { Row, Col } from "react-bootstrap";
import "./PageTitle.css";

interface PageTitleProps {
	title: string;
}

const PageTitle = ({ title }: PageTitleProps) => {
	return (
		<Row className="mb-3 mt-3 pt-md-3">
			<Col lg="8">
				<h1 className="display-4">
					{title}
				</h1>
				<hr className="t_border text-left" />
			</Col>
		</Row>
	);
};

export default PageTitle;