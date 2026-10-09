import React from "react";
import { FiArrowUpRight, FiCode, FiLayers, FiMonitor } from "react-icons/fi";
import "./ServicesSection.css";

interface ServiceEntry {
	title: string;
	text: string;
}

interface ServicesSectionProps {
	entries: ServiceEntry[];
}

const icons: React.ComponentType[] = [FiLayers, FiMonitor, FiCode];

const ServicesSection = ({ entries }: ServicesSectionProps) => {
	return (
		<div className="services-grid">
			{entries.map((entry, index) => {
				const Icon = icons[index] || FiCode;
				return (
				<article className="service-box" key={entry.title}>
					<div className="service-topline">
						<Icon />
					</div>
					<h3 className="service__title">{entry.title}</h3>
					<p className="service_desc">{entry.text}</p>
					<FiArrowUpRight className="service-arrow" />
				</article>
				);
			})}
		</div>
	);
};

export default ServicesSection;
