import React, { useEffect, useRef, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { FaGamepad } from "react-icons/fa";
import { FiCpu } from "react-icons/fi";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import "./Snake.css";

const MINIQUAD_BUNDLE_URL = "https://not-fl3.github.io/miniquad-samples/mq_js_bundle.js";

const Snake = () => {
	const { t } = useLang();
	const canvasRef = useRef(null);
	const [gameStatus, setGameStatus] = useState(t("snake.loading"));

	useEffect(() => {
		const script = document.createElement("script");
		script.src = MINIQUAD_BUNDLE_URL;
		script.async = true;

		script.onload = () => {
			try {
				window.load("/wasm/snake.wasm");
				canvasRef.current?.focus();
				setGameStatus(t("snake.ready"));
			} catch (error) {
				console.error("Failed to start Snake:", error);
				setGameStatus(t("snake.start_failed"));
			}
		};

		script.onerror = () => {
			setGameStatus(t("snake.runtime_failed"));
		};

		document.body.appendChild(script);

		return () => {
			script.remove();
		};
	}, [t]);

	return (
		<HelmetProvider>
			<main className="snake-page">
				<Tab title={t("snake.title")} />
				<header className="snake-hero">
					<div className="snake-hero-grid" aria-hidden="true"></div>
					<div className="snake-hero-copy">
						<div className="snake-kicker"><span>RS</span> {t("snake.kicker")}</div>
						<h1>{t("snake.title")}</h1>
						<p>{t("snake.description")}</p>
					</div>
					<div className="snake-specs" aria-hidden="true">
						<div><span>RUNTIME</span><strong>RUST / WASM</strong></div>
						<div><span>ENGINE</span><strong>MINIQUAD</strong></div>
						<div><span>GRID</span><strong>20 × 20</strong></div>
						<FiCpu />
					</div>
				</header>

				<section className="snake-game-section" aria-labelledby="snake-game-title">
					<div className="snake-game-header">
						<div>
							<span className="snake-section-label">{t("snake.section_label")}</span>
							<h2 id="snake-game-title">{t("snake.game_title")}</h2>
						</div>
						<span className="snake-status"><i></i>{gameStatus}</span>
					</div>
					<div className="snake-canvas-frame">
						<canvas
							ref={canvasRef}
							id="glcanvas"
							tabIndex="0"
							aria-label={t("snake.aria_label")}
						/>
					</div>
				</section>
			</main>
		</HelmetProvider>
	);
};

export default Snake;