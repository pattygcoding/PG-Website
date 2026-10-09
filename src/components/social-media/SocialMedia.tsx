import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { SocialIcon } from "./social-icon/SocialIcon";
import { useLang } from "@/lang/languageContext";
import l from '@/assets/links/links.json';
import "./SocialMedia.css";

const SocialMedia = () => {
	const { t } = useLang();

	return (
		<nav className="stick_follow_icon" aria-label="Social media links">
			<div className="stick_follow_panel">
				<ul>
					<SocialIcon url={l.social_media.linkedin} Icon={FaLinkedin} label="LinkedIn" />
					<SocialIcon url={l.social_media.github} Icon={FaGithub} label="GitHub" />
				</ul>
			</div>
			<p>{t("social_media.text_strip")}</p>
		</nav>
	);
};

export default SocialMedia;
