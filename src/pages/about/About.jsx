import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { AboutSection } from "./about-section";
import LinkedSkillsTable from "./linked-skills-table/LinkedSkillsTable";
import ServicesSection from "./services-section/ServicesSection";
import UnlinkedSkillsTable from "./unlinked-skills-table/UnlinkedSkillsTable";
import WorkHistoryTable from "./work-history-table/WorkHistoryTable";
import { Tab } from "@/components/tab";
import p from "@/assets/projects/projects.json";
import s from '@/assets/skills/skills.json';
import t from '@/assets/lang/en_us.json';
import "./About.css";

const About = () => {
	return (
		<HelmetProvider>
			<Container className="About-header">
				<Tab title={t.about.title} />
				<PageTitle title={t.about.title} />
				<AboutSection title={t.about.personal_summary.title}>
					<div className="d-flex align-items-center">
						<p>{t.about.personal_summary.text}</p>
					</div>
				</AboutSection>

				<AboutSection title={t.about.professional_experience.title}>
					<WorkHistoryTable entries={t.about.professional_experience.entries} />
				</AboutSection>

				<AboutSection title={t.about.technical_skills.title}>
					<LinkedSkillsTable
						header="Programming Languages"
						list={s.languages}
						projects={p.projects}
					/>
					<LinkedSkillsTable
						header="Frameworks & Formats"
						list={s.frameworks}
						projects={p.projects}
					/>
					<UnlinkedSkillsTable
						header="Other Technologies"
						list={s.other_technologies.map(o => o.name)}
					/>
				</AboutSection>

				<AboutSection title={t.about.services.title}>
					<ServicesSection entries={t.about.services.entries} />
				</AboutSection>

			</Container>
		</HelmetProvider>
	);
};

export default About;