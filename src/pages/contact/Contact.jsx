import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { FiArrowUpRight, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import links from "@/assets/links/links.json";
import "@/components/page-shell/PageShell.css";
import "./ContactChannels.css";

const Contact = () => {
	const { t } = useLang();

	return (
		<HelmetProvider>
			<main className="contact-page portfolio-shell">
				<Tab title={t("contact.title")} />
				<header className="page-heading">
						<div className="page-eyebrow"><span>{t("contact.title")}</span><span>Patrick Goodwin / 04</span></div>
						<h1>{t("contact.title")}</h1>
						<p>{t("contact.description")}</p>
				</header>
				<section className="contact-channels" aria-label={t("contact.header")}>
						<div className="contact-direct">
							<div className="contact-section-label"><span>01 / Email</span><FiMail aria-hidden="true" /></div>
							<h2>{t("contact.header")}</h2>
							<a className="contact-email" href={`mailto:${t("contact.email")}`}>
								<span>{t("contact.email")}</span><FiArrowUpRight aria-hidden="true" />
							</a>
						</div>
						<nav className="contact-socials" aria-label="Social contact links">
							<a href={links.social_media.linkedin} target="_blank" rel="noopener noreferrer"><span className="contact-social-index">02</span><FiLinkedin /><span>LinkedIn</span><FiArrowUpRight /></a>
							<a href={links.social_media.github} target="_blank" rel="noopener noreferrer"><span className="contact-social-index">03</span><FiGithub /><span>GitHub</span><FiArrowUpRight /></a>
						</nav>
				</section>
			</main>
		</HelmetProvider>
	);
};

export default Contact;
