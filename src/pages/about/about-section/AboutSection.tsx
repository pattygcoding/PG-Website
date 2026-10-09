import React from "react";
import "./AboutSection.css";

interface AboutSectionProps {
	id: string;
	label: React.ReactNode;
	title: React.ReactNode;
	children?: React.ReactNode;
}

const AboutSection = ({ id, label, title, children }: AboutSectionProps) => (
	<section id={id} className="about-section sec_sp">
		<header className="about-section-heading">
			<div>
				<div className="section-label">// {label}</div>
				<h2>{title}</h2>
			</div>
		</header>
		<div className="about-section-body">{children}</div>
	</section>
);

export default AboutSection;