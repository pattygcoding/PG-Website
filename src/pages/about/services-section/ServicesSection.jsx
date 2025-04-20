import React from "react";
import "./ServicesSection.css"; // optional for styling

const ServicesSection = ({ entries }) => {
	return (
		<>
			{entries.map((entry, index) => (
				<div className="service_ py-4" key={index}>
					<h5 className="service__title">{entry.title}</h5>
					<p className="service_desc">{entry.text}</p>
				</div>
			))}
		</>
	);
};

export default ServicesSection;
