import React, { useState, useMemo } from "react";
import { HelmetProvider } from "react-helmet-async";
import {
	Container,
	Row,
	Col,
	Card,
	DropdownButton,
	Dropdown,
	FormControl
} from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import links from "@/assets/links/links.json";
import skills from "@/assets/skills/skills.json";
import projectsData from "@/assets/projects/projects.json";
import { useLocation } from "react-router-dom";
import "./Portfolio.css";

const Portfolio = () => {
	const { t } = useLang();
	const entries = t("portfolio.entries");
	const images = links.portfolio;
	const location = useLocation();

	// URL-backed selection state
	const [selectedSkills, setSelectedSkills] = useState(() => {
		const params = new URLSearchParams(location.search);
		const skillString = params.get("skills");
		return skillString ? skillString.split(",") : [];
	});

	// search terms for each dropdown
	const [searchTerm, setSearchTerm] = useState({
		languages: "",
		frameworks: "",
		other_technologies: ""
	});

	const resolveImage = (filename) => {
		return `/assets/images/${filename}`;
	};
	
	// Update URL
	const updateURL = (updated) => {
		const params = new URLSearchParams(location.search);
		if (updated.length) params.set("skills", updated.join(","));
		else params.delete("skills");
		window.history.replaceState(null, "", `${location.pathname}?${params}`);
	};

	const handleSkillSelect = (skillId) => {
		setSelectedSkills((prev) => {
			const updated = prev.includes(skillId)
				? prev.filter((id) => id !== skillId)
				: [...prev, skillId];
			updateURL(updated);
			return updated;
		});
	};

	const renderDropdown = (title, skillList, keyName) => {
		const term = searchTerm[keyName].toLowerCase();
		const filtered = skillList.filter((s) =>
			s.name.toLowerCase().includes(term)
		);

		// build dynamic title
		const selNames = skillList
			.filter((s) => selectedSkills.includes(s.id))
			.map((s) => s.name)
			.join(", ");
		const dynamicTitle = selNames ? `${title}: ${selNames}` : title;

		return (
			<DropdownButton
				key={keyName}
				id={`dropdown-${keyName}`}
				title={dynamicTitle}
				variant="primary"
				className="mb-2 filter-dropdown"
				renderMenuOnMount
			>
				<FormControl
					autoFocus
					placeholder={`Search ${title}…`}
					className="dropdown-search"
					value={searchTerm[keyName]}
					onChange={(e) =>
						setSearchTerm((prev) => ({
							...prev,
							[keyName]: e.target.value
						}))
					}
				/>
				<Dropdown.Divider />
				{filtered.map((skill) => (
					<Dropdown.Item
						key={skill.id}
						active={selectedSkills.includes(skill.id)}
						onClick={() => handleSkillSelect(skill.id)}
					>
						{skill.name}
					</Dropdown.Item>
				))}
			</DropdownButton>
		);
	};

	const groupToSkillsMap = useMemo(() => {
		const map = {};
		projectsData.projects.forEach((p) => {
			map[p.group] ||= new Set();
			p.skills.forEach((s) => map[p.group].add(s));
		});
		return map;
	}, [projectsData]);

	const isProjectVisible = (group) => {
		if (!selectedSkills.length) return true;
		const set = groupToSkillsMap[group] || new Set();
		return selectedSkills.some((s) => set.has(s));
	};

	return (
		<HelmetProvider>
			<Container className="About-header">
				<Tab title={t("portfolio.title")} />
				<PageTitle title={t("portfolio.title")} />

				<h3>{t("portfolio.filter_by")}</h3>
				<div className="dropdown-wrap-container">
					{renderDropdown(
						t("about.technical_skills.header1"),
						skills.languages,
						"languages"
					)}
					{renderDropdown(
						t("about.technical_skills.header2"),
						skills.frameworks,
						"frameworks"
					)}
					{renderDropdown(
						t("about.technical_skills.header3"),
						skills.other_technologies,
						"other_technologies"
					)}
				</div>

				<Row>
					{Object.entries(entries).map(
						([key, data]) =>
							isProjectVisible(key) && (
								<Col xs={12} key={key}>
									<a
										href={data.link}
										target="_blank"
										rel="noopener noreferrer"
										className="text-decoration-none text-reset"
									>
										<Card className="d-flex flex-row align-items-center portfolio-card hover-shadow">
											<Card.Img
												src={resolveImage(images[key] || images.placeholder)}
												alt={data.title}
												className="portfolio-card-img"
											/>
											<Card.Body>
												<Card.Title className="portfolio-card-title">
													{data.title}
												</Card.Title>
												<Card.Text>{data.text}</Card.Text>
											</Card.Body>
										</Card>
									</a>
								</Col>
							)
					)}
				</Row>
			</Container>
		</HelmetProvider>
	);
};

export default Portfolio;
