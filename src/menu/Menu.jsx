import React, { useEffect, useState } from "react";
import { VscGrabber, VscClose } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { MenuOptions } from "./menu-options";
import { Lang } from "./lang";
import { useLang } from "@/lang/languageContext";
import "./Menu.css";

const Menu = () => {
	const [isMenuOpen, setMenuOpen] = useState(false);
	const { t } = useLang();

	useEffect(() => {
		document.body.classList.remove("ovhidden");
	}, []);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape" && isMenuOpen) {
				closeMenu();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isMenuOpen]);

	const closeMenu = () => {
		setMenuOpen(false);
		document.body.classList.remove("ovhidden");
	};

	const handleToggle = () => {
		setMenuOpen((prev) => {
			const next = !prev;
			if (next) {
				document.body.classList.add("ovhidden");
			} else {
				document.body.classList.remove("ovhidden");
			}
			return next;
		});
	};

	return (
		<>
			<header className={`fixed-top site__header ${isMenuOpen ? "menu-is-active" : ""}`}>
				<div className="d-flex align-items-center justify-content-between header__container">
					<Link className="navbar-brand nav_ac tech__brand" to="/" onClick={closeMenu}>
						<span className="brand__symbol">&gt;</span>
						<span className="brand__text">{t("logotext")}</span>
						<span className="brand__blink">_</span>
					</Link>
					<div className="d-flex align-items-center header__actions">
						<Lang />
						<ThemeToggle />
						<button
							className={`menu__button nav_ac tech__toggle_btn ${isMenuOpen ? "is-active" : ""}`}
							onClick={handleToggle}
							aria-label={isMenuOpen ? "Close menu" : "Open menu"}
							aria-expanded={isMenuOpen}
						>
							{isMenuOpen ? <VscClose className="toggle-icon-close" /> : <VscGrabber className="toggle-icon-open" />}
						</button>
					</div>
				</div>
				<div className={`site__navigation ${isMenuOpen ? "menu__opend" : ""}`}>
					{isMenuOpen && <MenuOptions handleToggle={handleToggle} closeMenu={closeMenu} />}
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
