import React from "react";
import { HelmetProvider } from "react-helmet-async";
import Typewriter from "typewriter-effect";
import { Tab } from "@/components/tab";
import { Link } from "react-router-dom";
import { FiArrowRight, FiArrowUpRight, FiCode, FiGlobe, FiLayers, FiStar } from "react-icons/fi";
import { useLang } from "@/lang/languageContext";
import { LangAwareLink } from "@/components/lang-aware-link";
import links from "@/assets/links/links.json";
import "./Home.css";

const Home = () => {
	const { t } = useLang();
	const portfolioEntries = t("portfolio.entries");
	const featuredProjects = [
		{
			key: "takeoff_engine",
			image: links.portfolio.takeoff_engine,
			badges: [t("home.featured.badges.saas"), t("home.featured.badges.full_website")],
			featured: true,
		},
		{
			key: "tiger_programming_language",
			image: links.portfolio.tiger_programming_language,
			to: "/tiger",
			badges: [t("home.featured.badges.available_here")],
		},
		{
			key: "suprememc",
			image: links.portfolio.suprememc,
			badges: [t("home.featured.badges.minecraft_mod")],
		},
		{
			key: "snake",
			image: links.portfolio.snake,
			to: "/snake",
			badges: [t("home.featured.badges.available_here")],
		},
		{
			key: "portfolio_website",
			image: links.portfolio.portfolio_website,
			badges: [t("home.featured.badges.full_website")],
		},
		{
			key: "portfolio_translator",
			image: "biblioteca.png",
			to: "/languages",
			badges: [t("home.featured.badges.available_here")],
			data: {
				title: t("languages.title"),
				text: t("languages.description"),
			},
		},
	].map((project) => ({
		...project,
		data: project.data || portfolioEntries[project.key],
	}));

	const renderProjectLink = (project, content) => project.to ? (
		<LangAwareLink to={project.to} className="featured-project-link">
			{content}
		</LangAwareLink>
	) : (
		<a href={project.data.link} target="_blank" rel="noopener noreferrer" className="featured-project-link">
			{content}
		</a>
	);

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
								<div><span className="code-line">03</span>&nbsp;&nbsp;stack: [<span className="code-string">'React'</span>, <span className="code-string">'Angular'</span>,</div>
								<div><span className="code-line">04</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-string">'.NET'</span>, <span className="code-string">'Node.js'</span>, <span className="code-string">'Java'</span>,</div>
								<div><span className="code-line">05</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-string">'C#'</span>, <span className="code-string">'Go'</span>, <span className="code-string">'SQL'</span>],</div>
								<div><span className="code-line">06</span>&nbsp;&nbsp;ships: <span className="code-boolean">true</span></div>
								<div><span className="code-line">07</span>&#125;;<span className="code-caret"></span></div>
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

				<section className="featured-work" aria-labelledby="featured-work-title">
					<header className="featured-work-header">
						<div>
							<span className="featured-work-kicker"><FiStar aria-hidden="true" /> {t("home.featured.kicker")}</span>
							<h2 id="featured-work-title">{t("home.featured.title")}</h2>
						</div>
						<p>{t("home.featured.description")}</p>
					</header>

					<div className="featured-project-grid">
						{featuredProjects.map((project, index) => (
							<article className={`featured-project${project.featured ? " featured-project--lead" : ""}`} key={project.key}>
								{renderProjectLink(project, <>
									<div className="featured-project-visual">
										<img src={`/assets/images/${project.image}`} alt={`${project.data.title} logo`} />
										<span className="featured-project-number">{String(index + 1).padStart(2, "0")}</span>
										<span className="featured-project-arrow"><FiArrowUpRight aria-hidden="true" /></span>
									</div>
									<div className="featured-project-body">
										<div className="featured-project-badges">
											{project.badges.map((badge) => <span key={badge}>{badge}</span>)}
										</div>
										<h3>{project.data.title}</h3>
										<p>{project.data.text}</p>
										<span className="featured-project-cta">
											{project.to ? t("home.featured.open_project") : t("home.featured.view_project")}
											<FiArrowRight aria-hidden="true" />
										</span>
									</div>
								</>)}
							</article>
						))}
					</div>

					<LangAwareLink to="/portfolio" className="featured-work-all">
						<span>{t("home.featured.view_all")}</span>
						<FiArrowUpRight aria-hidden="true" />
					</LangAwareLink>
				</section>
			</section>
		</HelmetProvider>
	);
};

export default Home;
