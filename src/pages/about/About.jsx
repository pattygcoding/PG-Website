import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { FiArrowDown, FiArrowUpRight, FiMapPin } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import LangAwareLink from "@/components/lang-aware-link/LangAwareLink";
import { AboutSection } from "./about-section";
import LinkedSkillsTable from "./linked-skills-table/LinkedSkillsTable";
import ServicesSection from "./services-section/ServicesSection";
import WorkHistoryTable from "./work-history-table/WorkHistoryTable";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import p from "@/assets/projects/projects.json";
import s from "@/assets/skills/skills.json";
import links from "@/assets/links/links.json";
import "./AboutProfile.css";

const About = () => {
	const { t } = useLang();
	const location = useLocation();
	const featuredWork = ["takeoff_engine", "tiger_programming_language", "formatter"];
	const entries = t("portfolio.entries");
	const technologies = s.languages.length + s.frameworks.length + s.other_technologies.length;

	return (
		<HelmetProvider>
			<main className="about-page">
				<Tab title={t("about.title")} />
				<header className="about-hero">
					<div className="about-eyebrow"><span>{t("about.title")}</span><span><FiMapPin /> Orlando, FL</span></div>
					<div className="about-hero-copy">
						<h1>{t("name")}<span className="about-name-period">.</span></h1>
						<p className="about-hero-statement">{t("home.title")}</p>
						<div className="about-hero-actions">
							<LangAwareLink to="/contact" className="about-contact-link">{t("home.contact_button")}<FiArrowUpRight /></LangAwareLink>
							<a href={`${location.search}#about-toolkit`}>{t("about.technical_skills.title")}<FiArrowDown /></a>
						</div>
					</div>
				</header>
				<div className="about-facts" aria-label={t("about.title")}>
					<div><strong>6+</strong><span>{t("about.professional_experience.title")}</span></div>
					<div><strong>{Object.keys(entries).length}</strong><span>{t("home.atlas.projects")}</span></div>
					<div><strong>{technologies}</strong><span>{t("home.atlas.technologies")}</span></div>
					<LangAwareLink to="/portfolio">{t("home.featured.view_all")}<FiArrowUpRight /></LangAwareLink>
				</div>
				<nav className="about-section-nav" aria-label={t("about.title")}>
					{["personal_summary", "professional_experience", "technical_skills", "services"].map((section, index) => (
						<a key={section} href={`${location.search}#about-${["overview", "timeline", "toolkit", "capabilities"][index]}`}><span>0{index + 1}</span>{t(`about.${section}.title`)}</a>
					))}
				</nav>

				<div className="about-content">
				<AboutSection id="about-overview" index="01" label="OVERVIEW" title={t("about.personal_summary.title")}>
					<div className="d-flex align-items-center personal-summary-box">
						<p>{t("about.personal_summary.text")}</p>
					</div>
					<div className="about-work-strip">
						{featuredWork.map((key) => (
							<a key={key} href={entries[key].link} target="_blank" rel="noopener noreferrer">
								<img src={`/assets/images/${links.portfolio[key]}`} alt="" loading="lazy" />
								<span>{entries[key].title}</span><FiArrowUpRight />
							</a>
						))}
					</div>
				</AboutSection>

				<AboutSection id="about-timeline" index="02" label="TIMELINE" title={t("about.professional_experience.title")}>
					<WorkHistoryTable entries={t("about.professional_experience.entries")} />
				</AboutSection>

				<AboutSection id="about-toolkit" index="03" label="TOOLKIT" title={t("about.technical_skills.title")}>
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

				<AboutSection id="about-capabilities" index="04" label="CAPABILITIES" title={t("about.services.title")}>
					<ServicesSection entries={t("about.services.entries")} />
				</AboutSection>
				</div>
				<footer className="about-closing"><span>{t("home.atlas.footer")}</span><LangAwareLink to="/contact">{t("home.atlas.contact")}<FiArrowUpRight /></LangAwareLink></footer>
			</main>
		</HelmetProvider>
	);
};

export default About;
