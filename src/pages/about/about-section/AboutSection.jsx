import React from "react";
import { Row, Col } from "react-bootstrap";
import "./AboutSection.css";

const AboutSection = ({ title, children }) => (
	<Row className="sec_sp">
		<Col lg="5">
			<h3 className="color_sec py-4">{title}</h3>
		</Col>
		<Col lg="7">
			{children}
		</Col>
	</Row>
);

export default AboutSection;