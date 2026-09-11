import React from "react";
import { HelmetProvider } from "react-helmet-async";
import Typewriter from "typewriter-effect";
import { Tab } from "@/components/tab";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiCode, FiGlobe, FiLayers } from "react-icons/fi";
import { useLang } from "@/lang/languageContext";
import { LangAwareLink } from "@/components/lang-aware-link";
import "./Home.css";

const Home = () => {
	const { t } = useLang();

	return (
		<HelmetProvider>
			<section id="home" className="home">
				<Tab title={t("home.title")} />
				<div className="intro_sec">
					<div className="hero-copy">
						<div className="intro">
							<div className="hero-kicker">
								<span className="hero-kicker-mark" aria-hidden="true"></span>
								{t("home.title")}
							</div>
							<h1 className="hero-name">{t("name")}</h1>
							<div className="hero-role" aria-live="polite">
									<Typewriter
										options={{
											strings: [
												t("home.animated.first"),
												t("home.animated.second"),
												t("home.animated.third"),
												t("home.animated.fourth"),
											],
											autoStart: true,
											loop: true,
											deleteSpeed: 10,
										}}
									/>
							</div>

							<div className="hero-description">
								<p>{t("home.descriptionA")}</p>
								<p>{t("home.descriptionB")}</p>
							</div>
								
							<div className="intro_btn-action">
								<LangAwareLink to="/portfolio" className="hero-button hero-button-primary">
									<span>{t("home.portfolio_button")}</span>
									<FiArrowUpRight aria-hidden="true" />
								</LangAwareLink>
								<LangAwareLink to="/about" className="hero-button">
									<span>{t("home.about_button")}</span>
									<FiArrowUpRight aria-hidden="true" />
								</LangAwareLink>
								<LangAwareLink to="/contact" className="hero-button">
									<span>{t("home.contact_button")}</span>
									<FiArrowUpRight aria-hidden="true" />
									</LangAwareLink>
							</div>
							<Link className="language-link" to="/languages">
								<FiGlobe aria-hidden="true" />
								<span>{t("home.footer")}</span>
								<FiArrowUpRight aria-hidden="true" />
							</Link>
						</div>
					</div>

					<div className="hero-visual" aria-hidden="true">
						<div className="visual-grid"></div>
						<div className="visual-index">PG / 01</div>
						<div className="portrait-frame">
							<div className="home_img"></div>
							<div className="portrait-corner portrait-corner-top"></div>
							<div className="portrait-corner portrait-corner-bottom"></div>
						</div>

						<div className="code-window">
							<div className="code-window-bar">
								<div className="window-dots"><i></i><i></i><i></i></div>
								<span>patrick.ts</span>
								<FiCode />
							</div>
							<div className="code-content">
								<div><span className="code-line">01</span><span className="code-keyword">const</span> engineer = &#123;</div>
								<div><span className="code-line">02</span>&nbsp;&nbsp;focus: <span className="code-string">'useful software'</span>,</div>
								<div><span className="code-line">03</span>&nbsp;&nbsp;stack: [<span className="code-string">'React'</span>, <span className="code-string">'Go'</span>],</div>
								<div><span className="code-line">04</span>&nbsp;&nbsp;ships: <span className="code-boolean">true</span></div>
								<div><span className="code-line">05</span>&#125;;<span className="code-caret"></span></div>
							</div>
						</div>

						<div className="experience-badge">
							<strong>6+</strong>
							<span>YEARS<br />BUILDING</span>
						</div>

						<div className="capability-rail">
							<span><FiLayers /> FULL STACK</span>
							<span><FiCode /> PRODUCTS</span>
							<span><FiGlobe /> WEB</span>
						</div>
					</div>
				</div>
			</section>
		</HelmetProvider>
	);
};

export default Home;
