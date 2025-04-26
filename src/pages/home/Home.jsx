import React from "react";
import { HelmetProvider } from "react-helmet-async";
import Typewriter from "typewriter-effect";
import { Tab } from "@/components/tab";
import { Link } from "react-router-dom";
import { useLang } from "@/lang/languageContext";
import { LangAwareLink } from "@/components/lang-aware-link";
import "./Home.css";

const Home = () => {
	const { t } = useLang();

	return (
		<HelmetProvider>
			<section id="home" className="home">
				<Tab title={t("home.title")} />
				<div className="intro_sec d-block d-lg-flex align-items-center ">
					<div className="h_bg-image order-1 order-lg-2 h-100 home_img"></div>
					<div className="text order-2 order-lg-1 h-100 d-lg-flex justify-content-center">
						<div className="align-self-center ">
							<div className="intro mx-auto">
								<h2 className="mb-1x">{t("name")}</h2>
								<h1 className="fluidz-48 mb-1x">
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
								</h1>

								<p className="mb-1x">{t("home.descriptionA")}</p>
								<p className="mb-1x">{t("home.descriptionB")}</p>
								
								<div className="intro_btn-action pb-5">
									<LangAwareLink to="/portfolio" className="text_2">
										<div id="button_p" className="ac_btn btn ">
											{t("home.portfolio_button")}
											<div className="ring one"></div>
											<div className="ring two"></div>
											<div className="ring three"></div>
										</div>
									</LangAwareLink>
									<LangAwareLink to="/about">
										<div id="button_h" className="ac_btn btn">
											{t("home.about_button")}
											<div className="ring one"></div>
											<div className="ring two"></div>
											<div className="ring three"></div>
										</div>
									</LangAwareLink>
									<LangAwareLink to="/contact">
										<div id="button_h" className="ac_btn btn">
											{t("home.contact_button")}
											<div className="ring one"></div>
											<div className="ring two"></div>
											<div className="ring three"></div>
										</div>
									</LangAwareLink>
								</div>
								<h3>{t("home.footer")}</h3>
							</div>
						</div>
					</div>
				</div>
			</section>
		</HelmetProvider>
	);
};

export default Home;
