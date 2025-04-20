import React, { useState } from "react";
import { VscGrabber, VscClose } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { MenuBottomStrip } from "./menu-bottom-strip";
import { MenuOptions } from "./menu-options";
import t from '@/assets/lang/en_us.json';
import "./Menu.css";

const Menu = () => {
	const [isActive, setActive] = useState("false");

	const handleToggle = () => {
		setActive(!isActive);
		document.body.classList.toggle("ovhidden");
	};

	return (
		<>
			<header className="fixed-top site__header">
				<div className="d-flex align-items-center justify-content-between">
					<Link className="navbar-brand nav_ac" to="/">
						{t.logotext}
					</Link>
					<div className="d-flex align-items-center">
						<ThemeToggle />
						<button className="menu__button  nav_ac" onClick={handleToggle}>
							{!isActive ? <VscClose /> : <VscGrabber />}
						</button>
					</div>
				</div>
				<div className={`site__navigation ${!isActive ? "menu__opend" : ""}`}>
					<MenuOptions handleToggle={handleToggle} />
					<MenuBottomStrip />
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
