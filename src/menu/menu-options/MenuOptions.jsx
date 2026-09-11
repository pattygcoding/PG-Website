import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { MenuItem } from "./menu-item";
import l from "@/assets/links/links.json";
import { useLang } from "@/lang/languageContext";
import {
	VscChevronDown,
	VscChevronUp,
	VscFolder,
	VscFolderOpened,
	VscTerminal,
	VscGlobe,
	VscJson,
	VscHome,
	VscAccount,
	VscBriefcase,
	VscMail,
	VscClose,
} from "react-icons/vsc";
import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";
import "./MenuOptions.css";

const MenuOptions = ({ handleToggle, closeMenu }) => {
	const { t } = useLang();
	const location = useLocation();
	const [showProjects, setShowProjects] = useState(
		location.pathname.startsWith("/tiger") ||
		location.pathname.startsWith("/languages") ||
		location.pathname.startsWith("/formatter")
	);

	const isProjectActive =
		location.pathname.startsWith("/tiger") ||
		location.pathname.startsWith("/languages") ||
		location.pathname.startsWith("/formatter");

	const handleItemClick = (e) => {
		if (closeMenu) {
			closeMenu();
		} else if (handleToggle) {
			handleToggle();
		}
	};

	return (
		<div className="tech__menu_overlay">
			{/* HUD / Telemetry Header */}
			<div className="tech__hud_header">
				<div className="tech__hud_left">
					<span className="tech__pulse_indicator">
						<span className="tech__pulse_dot"></span>
						<span className="tech__hud_status">SYS_STATUS // ONLINE</span>
					</span>
					<span className="tech__hud_divider">|</span>
					<span className="tech__hud_tag">NAV_MATRIX v2.5</span>
				</div>
				<div className="tech__hud_center d-none d-md-block">
					<span className="tech__hud_coords">LOC: 28.5383° N, 81.3792° W [ORL, FL]</span>
				</div>
				<div className="tech__hud_right">
					<button
						type="button"
						className="tech__hud_close_btn"
						onClick={closeMenu || handleToggle}
						title="Close navigation (ESC)"
					>
						<span className="d-none d-sm-inline">[ESC]</span> CLOSE <VscClose />
					</button>
				</div>
			</div>

			{/* Main Scrollable Grid Content */}
			<div className="tech__menu_scroll_area">
				<div className="container tech__menu_container">
					<div className="row g-4 align-items-start">
						{/* Left Column: Primary Navigation */}
						<div className="col-12 col-lg-7">
							<div className="tech__section_header">
								<span className="tech__section_prompt">&gt;</span>
								<span className="tech__section_title">PRIMARY_DIRECTIVES</span>
								<span className="tech__section_line"></span>
							</div>

							<ul className="tech__nav_list">
								<MenuItem
									to={l.menu.home}
									index="01 //"
									label={t("menu.home")}
									desc="sys.root // main overview"
									tag="[ROOT]"
									icon={VscHome}
									onClick={handleItemClick}
								/>
								<MenuItem
									to={l.menu.about}
									index="02 //"
									label={t("menu.about")}
									desc="engineer profile // bio & stack"
									tag="[BIO]"
									icon={VscAccount}
									onClick={handleItemClick}
								/>
								<MenuItem
									to={l.menu.portfolio}
									index="03 //"
									label={t("menu.portfolio")}
									desc="software catalog // featured works"
									tag="[WORKS]"
									icon={VscBriefcase}
									onClick={handleItemClick}
								/>

								{/* Website Projects Accordion */}
								<li className="menu_item tech__menu_item tech__project_group">
									<button
										type="button"
										className={`tech__menu_link tech__menu_btn ${isProjectActive ? "is-active" : ""}`}
										onClick={() => setShowProjects(!showProjects)}
										aria-expanded={showProjects}
									>
										<div className="tech__menu_item_inner">
											<div className="tech__menu_item_left">
												<span className="tech__item_index">04 //</span>
												<span className="tech__item_icon">
													{showProjects ? <VscFolderOpened /> : <VscFolder />}
												</span>
												<div className="tech__item_text_group">
													<span className="tech__item_label">{t("menu.projects")}</span>
													<span className="tech__item_desc">interactive tools & compilers</span>
												</div>
											</div>
											<div className="tech__menu_item_right">
												<span className="tech__item_tag">[3 MODULES]</span>
												<span className="tech__chevron_icon">
													{showProjects ? <VscChevronUp /> : <VscChevronDown />}
												</span>
											</div>
										</div>
									</button>

									{showProjects && (
										<div className="tech__submenu_container">
											<div className="tech__submenu_line"></div>
											<ul className="tech__submenu_list">
												<MenuItem
													to={l.menu.tiger}
													index="04.1"
													label={t("menu.tiger")}
													desc="custom compiler & AST visualizer"
													tag="[COMPILER]"
													icon={VscTerminal}
													isSubmenu={true}
													onClick={handleItemClick}
												/>
												<MenuItem
													to={l.menu.languages}
													index="04.2"
													label={t("menu.portfolio_translator")}
													desc="100+ language matrix & i18n"
													tag="[I18N]"
													icon={VscGlobe}
													isSubmenu={true}
													onClick={handleItemClick}
												/>
												<MenuItem
													to={l.menu.formatter}
													index="04.3"
													label={t("menu.formatter")}
													desc="syntax validator & converter"
													tag="[PARSER]"
													icon={VscJson}
													isSubmenu={true}
													onClick={handleItemClick}
												/>
											</ul>
										</div>
									)}
								</li>

								<MenuItem
									to={l.menu.contact}
									index="05 //"
									label={t("menu.contact")}
									desc="open transmission // get in touch"
									tag="[COMMS]"
									icon={VscMail}
									onClick={handleItemClick}
								/>
							</ul>
						</div>

						{/* Right Column: Telemetry Specs & Social Hub */}
						<div className="col-12 col-lg-5">
							{/* Terminal Console Card */}
							<div className="tech__card tech__terminal_card mb-4">
								<div className="tech__card_header">
									<div className="tech__card_dots">
										<span className="dot dot-red"></span>
										<span className="dot dot-yellow"></span>
										<span className="dot dot-green"></span>
									</div>
									<span className="tech__card_title">specs@pattyg:~</span>
								</div>
								<div className="tech__terminal_body">
									<div className="tech__term_row">
										<span className="term_prompt">$</span>
										<span className="term_cmd">whoami</span>
									</div>
									<div className="term_output term_highlight">
										Patrick Goodwin // Senior Software Engineer
									</div>

									<div className="tech__term_row mt-2">
										<span className="term_prompt">$</span>
										<span className="term_cmd">sys.location</span>
									</div>
									<div className="term_output">
										Orlando, FL, USA (Remote / Hybrid)
									</div>

									<div className="tech__term_row mt-2">
										<span className="term_prompt">$</span>
										<span className="term_cmd">stack --primary</span>
									</div>
									<div className="term_output">
										React • TypeScript • Node.js • .NET • Java • Python
									</div>

									<div className="tech__term_row mt-2">
										<span className="term_prompt">$</span>
										<span className="term_cmd">status</span>
									</div>
									<div className="term_output term_badge_status">
										<span className="status_dot"></span> OPEN TO CONNECT & COLLABORATE
									</div>
								</div>
							</div>

							{/* Social Media Terminal Card */}
							<div className="tech__card tech__social_card">
								<div className="tech__card_header">
									<span className="tech__card_badge">// COMM_CHANNELS</span>
									<span className="tech__card_sub">SOCIAL TRANSMISSION</span>
								</div>
								<div className="tech__social_grid">
									<a
										href={l.social_media.github}
										target="_blank"
										rel="noopener noreferrer"
										className="tech__social_link"
									>
										<span className="social_icon_wrap">
											<FaGithub />
										</span>
										<div className="social_text_wrap">
											<span className="social_name">GitHub</span>
											<span className="social_handle">@pattygcoding</span>
										</div>
									</a>
									<a
										href={l.social_media.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										className="tech__social_link"
									>
										<span className="social_icon_wrap">
											<FaLinkedin />
										</span>
										<div className="social_text_wrap">
											<span className="social_name">LinkedIn</span>
											<span className="social_handle">/patrickgoodwin7</span>
										</div>
									</a>
									<a
										href={l.social_media.youtube}
										target="_blank"
										rel="noopener noreferrer"
										className="tech__social_link"
									>
										<span className="social_icon_wrap">
											<FaYoutube />
										</span>
										<div className="social_text_wrap">
											<span className="social_name">YouTube</span>
											<span className="social_handle">@patty_g7</span>
										</div>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Telemetry Footer */}
			<div className="tech__hud_footer">
				<div className="container-fluid d-flex flex-wrap align-items-center justify-content-between">
					<span className="tech__footer_copy">
						PATRICK GOODWIN © {new Date().getFullYear()} // ALL SYSTEMS OPERATIONAL
					</span>
					<span className="tech__footer_meta d-none d-sm-inline">
						PROTOCOL: ENCRYPTED // REACT_SPA
					</span>
				</div>
			</div>
		</div>
	);
};

export default MenuOptions;