import React, { useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container, Row, Col, Card, Dropdown, DropdownButton } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import links from '@/assets/links/links.json';
import skills from '@/assets/skills/skills.json';
import projectsData from '@/assets/projects/projects.json';
import "./Portfolio.css";

const Portfolio = () => {
	const { t } = useLang();
	const entries = t("portfolio.entries");
	const images = links.portfolio;
	const [selectedSkills, setSelectedSkills] = useState([]);

	const resolveImage = (filename) => {
		try {
			return require(`@/assets/images/${filename}`);
		} catch {
			return require(`@/assets/images/logo.png`);
		}
	};

	const handleSkillSelect = (skillId) => {
		setSelectedSkills((prev) =>
			prev.includes(skillId)
				? prev.filter((id) => id !== skillId)
				: [...prev, skillId]
		);
	};

	const renderDropdown = (title, skillList) => (
		<DropdownButton id={`dropdown-${title}`} title={title} className="me-3 mb-2">
			{skillList.map((skill) => (
				<Dropdown.Item
					key={skill.id}
					onClick={() => handleSkillSelect(skill.id)}
					active={selectedSkills.includes(skill.id)}
				>
					{skill.name}
				</Dropdown.Item>
			))}
		</DropdownButton>
	);

	// Build a map from group name to associated project skills
	const groupToSkillsMap = {};
	projectsData.projects.forEach((project) => {
		if (!groupToSkillsMap[project.group]) {
			groupToSkillsMap[project.group] = new Set();
		}
		project.skills.forEach((skill) => groupToSkillsMap[project.group].add(skill));
	});

	const isProjectVisible = (group) => {
		if (selectedSkills.length === 0) return true;
		const projectSkills = groupToSkillsMap[group] || new Set();
		return selectedSkills.some((skill) => projectSkills.has(skill));
	};

	return (
		<HelmetProvider>
			<Container className="About-header">
				<Tab title={t("portfolio.title")} />
				<PageTitle title={t("portfolio.title")} />

				<h3>{t("portfolio.filter_by")}</h3>
				<div className="d-flex align-items-center mb-4">
					{renderDropdown(t("about.technical_skills.header1"), skills.languages)}
					{renderDropdown(t("about.technical_skills.header2"), skills.frameworks)}
					{renderDropdown(t("about.technical_skills.header3"), skills.other_technologies)}
				</div>

				<Row>
					{Object.entries(entries).map(([key, data]) => (
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
					))}
				</Row>
			</Container>
		</HelmetProvider>
	);
};

export default Portfolio;
