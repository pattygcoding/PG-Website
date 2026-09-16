import React, { useEffect, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { VscClose } from "react-icons/vsc";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import MenuOptions from "./menu-options/MenuOptions";
import { Lang } from "./lang";
import { useLang } from "@/lang/languageContext";
import "./Menu.css";

const Menu = () => {
	const [isMenuOpen, setMenuOpen] = useState(false);
	const headerRef = useRef(null);
	const toggleRef = useRef(null);
	const { pathname } = useLocation();
	const { t } = useLang();

	useEffect(() => {
		setMenuOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!isMenuOpen) return;
		const header = headerRef.current;
		const toggle = toggleRef.current;
		const alreadyLocked = document.body.classList.contains("ovhidden");
		const siblings = Array.from(header.parentElement.children).filter((element) => element !== header && !element.hasAttribute("inert"));
		siblings.forEach((element) => element.setAttribute("inert", ""));
		document.body.classList.add("ovhidden");
		toggle.focus();
		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				if (event.target.closest?.(".lang-dropdown")) {
					header.querySelector(".lang-toggle")?.focus();
					return;
				}
				setMenuOpen(false);
			}
			if (event.key === "Tab") {
				const focusable = Array.from(header.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]')).filter((element) => element.getClientRects().length > 0);
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (event.shiftKey && document.activeElement === first) {
					event.preventDefault();
					last?.focus();
				} else if (!event.shiftKey && document.activeElement === last) {
					event.preventDefault();
					first?.focus();
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			siblings.forEach((element) => element.removeAttribute("inert"));
			if (!alreadyLocked) document.body.classList.remove("ovhidden");
			toggle.focus();
		};
	}, [isMenuOpen]);

	const closeMenu = () => {
		setMenuOpen(false);
	};

	const handleToggle = () => {
		setMenuOpen((previous) => !previous);
	};

	return (
		<>
			<div ref={headerRef} className={`fixed-top site__header ${isMenuOpen ? "menu-is-active" : ""}`} role={isMenuOpen ? "dialog" : "banner"} aria-modal={isMenuOpen ? "true" : undefined} aria-label={isMenuOpen ? "Site navigation" : undefined}>
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
							ref={toggleRef}
							type="button"
							className={`menu__button nav_ac tech__toggle_btn ${isMenuOpen ? "is-active" : ""}`}
							onClick={handleToggle}
							aria-label={isMenuOpen ? "Close menu" : "Open menu"}
							title={isMenuOpen ? "Close menu (Escape)" : "Open menu"}
							aria-controls="site-navigation"
							aria-expanded={isMenuOpen}
						>
							{isMenuOpen ? <VscClose className="toggle-icon-close" /> : <FiMenu className="toggle-icon-open" />}
						</button>
					</div>
				</div>
				<div id="site-navigation" className={`site__navigation ${isMenuOpen ? "menu__opend" : ""}`}>
					{isMenuOpen && <MenuOptions handleToggle={handleToggle} closeMenu={closeMenu} />}
				</div>
			</div>
		</>
	);
};

export default Menu;
