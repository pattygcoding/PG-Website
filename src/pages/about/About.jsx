import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { FiCode, FiMapPin, FiTerminal, FiZap } from "react-icons/fi";
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
			<main className="about-page">
				<Tab title={t("about.title")} />
				<header className="about-hero">
					<div className="about-hero-grid" aria-hidden="true"></div>
					<div className="about-hero-copy">
						<div className="about-kicker"><span>PROFILE</span> / ENGINEER_001</div>
						<h1>{t("about.title")}</h1>
						<p className="about-hero-statement">I build software that moves from ambitious idea to useful, reliable product.</p>
					</div>
					<div className="about-profile-panel">
						<div className="profile-status"><i></i> AVAILABLE TO CONNECT</div>
						<div className="profile-fact"><FiMapPin /><span>BASED IN</span><strong>Orlando, FL</strong></div>
						<div className="profile-fact"><FiCode /><span>EXPERIENCE</span><strong>6+ Years</strong></div>
						<div className="profile-fact"><FiZap /><span>FOCUS</span><strong>Products & Systems</strong></div>
						<div className="profile-command"><FiTerminal /> patrick@portfolio:~$ whoami<span>_</span></div>
					</div>
				</header>

				<div className="about-content">
				<AboutSection index="01" label="OVERVIEW" title={t("about.personal_summary.title")}>
					<div className="d-flex align-items-center personal-summary-box">
						<p>{t("about.personal_summary.text")}</p>
					</div>
				</AboutSection>

				<AboutSection index="02" label="TIMELINE" title={t("about.professional_experience.title")}>
					<WorkHistoryTable entries={t("about.professional_experience.entries")} />
				</AboutSection>

				<AboutSection index="03" label="TOOLKIT" title={t("about.technical_skills.title")}>
					<div className="skills-intro"><FiTerminal /> Select a technology to inspect related work.</div>
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

				<AboutSection index="04" label="CAPABILITIES" title={t("about.services.title")}>
					<ServicesSection entries={t("about.services.entries")} />
				</AboutSection>
				</div>
			</main>
		</HelmetProvider>
	);
};

export default About;
