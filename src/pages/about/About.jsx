import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { AboutSection } from "./about-section";
import LinkedSkillsTable from "./linked-skills-table/LinkedSkillsTable";
import ServicesSection from "./services-section/ServicesSection";
import WorkHistoryTable from "./work-history-table/WorkHistoryTable";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import p from "@/assets/projects/projects.json";
import s from "@/assets/skills/skills.json";
import "./About.css";

const About = () => {
	const { t } = useLang();

	return (
		<HelmetProvider>
			<Container className="About-header">
				<Tab title={t("about.title")} />
				<PageTitle title={t("about.title")} />

				<AboutSection title={t("about.personal_summary.title")}>
					<div className="d-flex align-items-center">
						<p>{t("about.personal_summary.text")}</p>
					</div>
				</AboutSection>

				<AboutSection title={t("about.professional_experience.title")}>
					<WorkHistoryTable entries={t("about.professional_experience.entries")} />
				</AboutSection>

				<AboutSection title={t("about.technical_skills.title")}>
					<LinkedSkillsTable
						header={t("about.technical_skills.header1")}
						list={s.languages}
						projects={p.projects}
					/>
					<LinkedSkillsTable
						header={t("about.technical_skills.header2")}
						list={s.frameworks}
						projects={p.projects}
					/>
					<LinkedSkillsTable
						header={t("about.technical_skills.header3")}
						list={s.other_technologies}
						projects={p.projects}
					/>
				</AboutSection>

				<AboutSection title={t("about.services.title")}>
					<ServicesSection entries={t("about.services.entries")} />
				</AboutSection>
			</Container>
		</HelmetProvider>
	);
};

export default About;
