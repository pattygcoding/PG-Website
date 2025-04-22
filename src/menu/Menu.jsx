import React, { useEffect, useState } from "react";
import { VscGrabber, VscClose } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { MenuBottomStrip } from "./menu-bottom-strip";
import { MenuOptions } from "./menu-options";
import { Lang } from "./lang";
import { useLang } from "@/lang/languageContext";
import "./Menu.css";

const Menu = () => {
	const [isMenuOpen, setMenuOpen] = useState(false);
	const [lang, setLang] = useState("en_us");

	useEffect(() => {
		document.body.classList.remove("ovhidden");
	}, []);

	const handleToggle = () => {
		const newState = !isMenuOpen;
		setMenuOpen(newState);
		document.body.classList.toggle("ovhidden", newState);
	};

	const { t } = useLang();

	return (
		<>
			<header className="fixed-top site__header">
				<div className="d-flex align-items-center justify-content-between">
					<Link className="navbar-brand nav_ac" to="/">
						{t("logotext")}
					</Link>
					<div className="d-flex align-items-center">
						<Lang />
						<ThemeToggle />
						<button className="menu__button nav_ac" onClick={handleToggle}>
							{isMenuOpen ? <VscClose /> : <VscGrabber />}
						</button>
					</div>
				</div>
				<div className={`site__navigation ${isMenuOpen ? "menu__opend" : ""}`}>
					<MenuOptions handleToggle={handleToggle} />
					
				</div>
			</header>
			<div className="br-top"></div>
			<div className="br-bottom"></div>
			<div className="br-left"></div>
			<div className="br-right"></div>
		</>
	);
};

export default Menu;
