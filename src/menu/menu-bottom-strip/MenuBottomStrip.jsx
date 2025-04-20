import React, { useState } from "react";
import l from '@/assets/links/links.json';
import t from '@/assets/lang/en_us.json';
import "./MenuBottomStrip.css";

const MenuBottomStrip = () => {

	return (
		<div className="menu_footer d-flex flex-column flex-md-row justify-content-between align-items-md-center position-absolute w-100 p-3 d-flex">
			<a href={l.social_media.linkedin}>{t.social_media.linkedin}</a>
			<a href={l.social_media.github}>{t.social_media.github}</a>
			<a href={l.social_media.youtube}>{t.social_media.youtube}</a>
			<a href={l.social_media.instagram}>{t.social_media.instagram}</a>
			<a href={l.social_media.tiktok}>{t.social_media.tiktok}</a>
		</div>
	);
};

export default MenuBottomStrip;
