import React from "react";
import { FiAward, FiArrowUpRight, FiCheckCircle } from "react-icons/fi";
import "./CertificationsSection.css";

const CertificationsSection = ({ entries, labels }) => {
	const { credential, issued_by, issued, verify } = labels;

	return (
		<div className="certifications-grid">
			{entries.map((entry) => (
				<article className="certification-card" key={entry.id}>
					<div className="certification-badge">
						<img
							src={`/assets/images/${entry.image}`}
							alt={`${entry.title} badge issued by ${entry.issuer}`}
							loading="lazy"
						/>
					</div>
					<div className="certification-details">
						<div className="certification-meta">
							<span className="certification-tag"><FiAward /> {credential}</span>
							{entry.date && <span className="certification-date"><FiCheckCircle /> {issued} {entry.date}</span>}
						</div>
						<h3 className="certification-title">{entry.title}</h3>
						<p className="certification-issuer">{issued_by} <strong>{entry.issuer}</strong></p>
						{entry.summary && <p className="certification-summary">{entry.summary}</p>}
						<a className="certification-link" href={entry.link} target="_blank" rel="noopener noreferrer">
							{verify}<FiArrowUpRight />
						</a>
					</div>
				</article>
			))}
		</div>
	);
};

export default CertificationsSection;