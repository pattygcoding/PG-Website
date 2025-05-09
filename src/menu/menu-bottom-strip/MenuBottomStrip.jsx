import React from "react";
import l from '@/assets/links/links.json';
import t from '@/assets/lang/en_us.json';
import "./MenuBottomStrip.css";

const MenuBottomStrip = () => {

	return (
		<div className="menu_footer position-absolute w-100">
			<a href={l.social_media.linkedin}>{t.social_media.linkedin}</a>
			<a href={l.social_media.github}>{t.social_media.github}</a>
			<a href={l.social_media.youtube}>{t.social_media.youtube}</a>
			<a href={l.social_media.instagram}>{t.social_media.instagram}</a>
			<a href={l.social_media.tiktok}>{t.social_media.tiktok}</a>
		</div>
	);
};

export default MenuBottomStrip;
