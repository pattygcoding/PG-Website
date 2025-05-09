import React from "react";
import { FaGithub, FaLinkedin, FaYoutube, FaInstagram, FaTiktok } from "react-icons/fa";
import { SocialIcon } from "./social-icon/SocialIcon";
import { useLang } from "@/lang/languageContext";
import l from '@/assets/links/links.json';
import "./SocialMedia.css";

const SocialMedia = () => {
	const { t } = useLang();

	return (
		<div className="stick_follow_icon">
			<ul>
				<SocialIcon url={l.social_media.linkedin} Icon={FaLinkedin} />
				<SocialIcon url={l.social_media.github} Icon={FaGithub} />
				<SocialIcon url={l.social_media.youtube} Icon={FaYoutube} />
				<SocialIcon url={l.social_media.instagram} Icon={FaInstagram} />
				<SocialIcon url={l.social_media.tiktok} Icon={FaTiktok} />
			</ul>
			<p>{t("social_media.text_strip")}</p>
		</div>
	);
};

export default SocialMedia;
