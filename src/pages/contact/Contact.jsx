import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { FiArrowUpRight, FiGithub, FiLinkedin, FiMail, FiMessageSquare, FiSend } from "react-icons/fi";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import links from "@/assets/links/links.json";
import "./Contact.css";

const Contact = () => {
	const { t } = useLang();

	return (
		<HelmetProvider>
			<main className="contact-page">
				<Tab title={t("contact.title")} />
				<section className="contact-stage">
					<div className="contact-grid" aria-hidden="true"></div>
					<div className="contact-copy">
						<div className="contact-kicker"><span></span> OPEN_CHANNEL / 01</div>
						<h1>{t("contact.title")}</h1>
						<p>{t("contact.description")}</p>
						<a className="contact-primary-action" href={`mailto:${t("contact.email")}`}>
							<FiSend /><span>START A CONVERSATION</span><FiArrowUpRight />
						</a>
					</div>

					<div className="contact-console">
						<div className="console-header">
							<div><i></i><i></i><i></i></div>
							<span>CONTACT_CHANNEL.EXE</span>
							<FiMessageSquare />
						</div>
						<div className="console-body">
							<div className="console-status"><i></i><span>STATUS</span><strong>ONLINE</strong></div>
							<div className="contact-label">{t("contact.header")}</div>
							<a className="contact-email" href={`mailto:${t("contact.email")}`}>
								<FiMail /><span>{t("contact.email")}</span><FiArrowUpRight />
							</a>
							<div className="contact-divider"><span>OTHER CHANNELS</span></div>
							<nav className="contact-socials" aria-label="Social contact links">
								<a href={links.social_media.linkedin} target="_blank" rel="noopener noreferrer"><FiLinkedin /><span>LinkedIn</span><FiArrowUpRight /></a>
								<a href={links.social_media.github} target="_blank" rel="noopener noreferrer"><FiGithub /><span>GitHub</span><FiArrowUpRight /></a>
							</nav>
							<div className="console-footer"><span>RESPONSE_MODE</span><strong>EMAIL_PREFERRED</strong></div>
						</div>
					</div>
				</section>
			</main>
		</HelmetProvider>
	);
};

export default Contact;
