import React from "react";
import "./AboutSection.css";

const AboutSection = ({ index, label, title, children }) => (
	<section className="about-section sec_sp">
		<header className="about-section-heading">
			<div className="section-index">{index}</div>
			<div>
				<div className="section-label">// {label}</div>
				<h2>{title}</h2>
			</div>
		</header>
		<div className="about-section-body">{children}</div>
	</section>
);

export default AboutSection;