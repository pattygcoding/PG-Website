import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { SocialIcon } from "./social-icon/SocialIcon";
import { useLang } from "@/lang/languageContext";
import l from '@/assets/links/links.json';
import "./SocialMedia.css";

const SocialMedia = () => {
	const { t } = useLang();

	return (
		<div className="stick_follow_icon" aria-label="Social media links">
			<div className="stick_follow_panel">
				<ul>
					<SocialIcon url={l.social_media.linkedin} Icon={FaLinkedin} />
					<SocialIcon url={l.social_media.github} Icon={FaGithub} />
				</ul>
			</div>
			<p>{t("social_media.text_strip")}</p>
		</div>
	);
};

export default SocialMedia;
