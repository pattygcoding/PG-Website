import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { FiArrowUpRight, FiDownload, FiGithub } from "react-icons/fi";
import { GiBearFace, GiDynamite, GiMagicPotion, GiPortal, GiStoneBlock, GiWarPick } from "react-icons/gi";
import { SiCurseforge } from "react-icons/si";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import { projectNumber } from "@/menu/projectCatalog";
import l from "@/assets/links/links.json";
import "@/components/page-shell/PageShell.css";
import "./SupremeMC.css";

const STATS = [
	{ key: "items", value: "330+" },
	{ key: "blocks", value: "260+" },
	{ key: "enchantments", value: "18" },
	{ key: "potions", value: "13" },
];

const FEATURES = [
	{ key: "gear", icon: GiWarPick },
	{ key: "mobs", icon: GiBearFace },
	{ key: "worlds", icon: GiPortal },
	{ key: "structures", icon: GiStoneBlock },
	{ key: "explosives", icon: GiDynamite },
	{ key: "magic", icon: GiMagicPotion },
];

const STACK = ["Java", "Kotlin", "Gradle", "Fabric", "NeoForge", "MultiLoader", "Data Generators"];

const SupremeMC = () => {
	const { t } = useLang();
	const asList = (key) => {
		const value = t(key);
		return Array.isArray(value) ? value : [];
	};

	return (
		<HelmetProvider>
			<main className="suprememc-page portfolio-shell">
				<Tab title={t("suprememc.title")} />
				<header className="page-heading">
					<div className="page-eyebrow"><span>{projectNumber("suprememc")} / {t("suprememc.title")}</span><a href={l.suprememc_curseforge} target="_blank" rel="noopener noreferrer"><SiCurseforge aria-hidden="true" /><span>{t("suprememc.curseforge.eyebrow")}</span><FiArrowUpRight aria-hidden="true" /></a></div>
					<h1>{t("suprememc.title")}</h1>
					<p>{t("suprememc.description")}</p>
				</header>

				<section className="suprememc-hero" aria-labelledby="suprememc-overview-title">
					<figure className="suprememc-hero__art">
						<img src="/assets/images/suprememc.png" alt={t("suprememc.image_alt")} width="920" height="922" decoding="async" />
					</figure>
					<div className="suprememc-hero__copy">
						<span className="suprememc-label">{t("suprememc.overview.label")}</span>
						<h2 id="suprememc-overview-title">{t("suprememc.overview.title")}</h2>
						<p>{t("suprememc.overview.text")}</p>
						<div className="suprememc-actions">
							<a className="suprememc-download" href={l.suprememc_curseforge} target="_blank" rel="noopener noreferrer">
								<SiCurseforge className="suprememc-download__logo" aria-hidden="true" />
								<span className="suprememc-download__copy">
									<strong>{t("suprememc.curseforge.cta")}</strong>
									<span>{t("suprememc.curseforge.subtitle")}</span>
								</span>
								<FiDownload className="suprememc-download__arrow" aria-hidden="true" />
							</a>
							<a className="suprememc-download suprememc-download--github" href={l.suprememc} target="_blank" rel="noopener noreferrer">
								<FiGithub className="suprememc-download__logo" aria-hidden="true" />
								<span className="suprememc-download__copy">
									<strong>{t("suprememc.github.cta")}</strong>
									<span>{t("suprememc.github.subtitle")}</span>
								</span>
								<FiArrowUpRight className="suprememc-download__arrow" aria-hidden="true" />
							</a>
						</div>
						<dl className="suprememc-stats">
							{STATS.map(({ key, value }) => (
								<div key={key}>
									<dt>{t(`suprememc.stats.${key}`)}</dt>
									<dd>{value}</dd>
								</div>
							))}
						</dl>
					</div>
				</section>

				<section className="suprememc-section" aria-labelledby="suprememc-features-title">
					<div className="suprememc-section__head">
						<span className="suprememc-label">{t("suprememc.features.label")}</span>
						<h2 id="suprememc-features-title">{t("suprememc.features.title")}</h2>
					</div>
					<ul className="suprememc-features">
						{FEATURES.map(({ key, icon: Icon }) => (
							<li key={key} className="suprememc-feature">
								<Icon className="suprememc-feature__icon" aria-hidden="true" />
								<h3>{t(`suprememc.features.${key}.title`)}</h3>
								<p>{t(`suprememc.features.${key}.text`)}</p>
								<ul className="suprememc-tags" aria-label={t("suprememc.features.examples")}>
									{asList(`suprememc.features.${key}.examples`).map((example) => <li key={example}>{example}</li>)}
								</ul>
							</li>
						))}
					</ul>
				</section>

				<section className="suprememc-section suprememc-build" aria-labelledby="suprememc-build-title">
					<div className="suprememc-section__head">
						<span className="suprememc-label">{t("suprememc.build.label")}</span>
						<h2 id="suprememc-build-title">{t("suprememc.build.title")}</h2>
						<p>{t("suprememc.build.text")}</p>
						<ul className="suprememc-tags suprememc-tags--stack" aria-label={t("suprememc.build.stack")}>
							{STACK.map((tech) => <li key={tech}>{tech}</li>)}
						</ul>
					</div>
					<ol className="suprememc-timeline">
						{asList("suprememc.build.timeline").map(({ version, text }) => (
							<li key={version}>
								<span className="suprememc-timeline__version">{version}</span>
								<p>{text}</p>
							</li>
						))}
					</ol>
				</section>
			</main>
		</HelmetProvider>
	);
};

export default SupremeMC;
