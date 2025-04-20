import React from "react";
import { MenuItem } from "./menu-item";
import l from '@/assets/links/links.json';
import { useLang } from "@/lang/languageContext";
import "./MenuOptions.css";

const MenuOptions = ({ handleToggle }) => {
	const { t } = useLang();

	return (
		<div className="bg__menu h-100 menu__wrapper p-3">
			<ul className="the_menu menu__container">
				<MenuItem to={l.menu.home} label={t("menu.home")} onClick={handleToggle} />
				<MenuItem to={l.menu.about} label={t("menu.about")} onClick={handleToggle} />
				<MenuItem to={l.menu.portfolio} label={t("menu.portfolio")} onClick={handleToggle} />
				<MenuItem to={l.menu.tiger} label={t("menu.tiger")} onClick={handleToggle} />
				<MenuItem to={l.menu.contact} label={t("menu.contact")} onClick={handleToggle} />
			</ul>
		</div>
	);
};

export default MenuOptions;
