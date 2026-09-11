import React, { useEffect, useRef, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { FaPlay } from "react-icons/fa";
import { FiArrowUpRight, FiCpu, FiGithub } from "react-icons/fi";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import l from '@/assets/links/links.json';
import { tokenize } from "./highlight.mjs";
import "./Tiger.css";

const tigerSamples = [
	"hello_world.tg",
	"closure_studio.tg",
	"event_simulation.tg",
	"geometry_workshop.tg",
	"graph_routes.tg",
	"inventory_report.tg",
	"library_catalog.tg",
	"number_lab.tg",
	"rule_engine.tg",
	"task_board.tg",
	"text_pipeline.tg",
];

const Tiger = () => {
	const { t } = useLang();

	const [code, setCode] = useState("");
	const [selectedSample, setSelectedSample] = useState("hello_world.tg");
	const [output, setOutput] = useState("Loading engine...");
	const [isReady, setIsReady] = useState(false);
	const codeEditorRef = useRef(null);

	const goLoaded = useRef(false);

	const loadSample = async (sampleName) => {
		setSelectedSample(sampleName);

		try {
			const response = await fetch(`/assets/tiger_samples/${sampleName}`);
			if (!response.ok) {
				throw new Error(`Unable to load ${sampleName}.`);
			}
			setCode(await response.text());
		} catch (err) {
			console.error("Failed to load Tiger sample:", err);
			setOutput(`Failed to load ${sampleName}.`);
		}
	};

	useEffect(() => {
		loadSample("hello_world.tg");
	}, []);

	useEffect(() => {
		const loadEngine = async () => {
			try {
				await new Promise((resolve, reject) => {
					const script = document.createElement("script");
					script.src = "/wasm_exec.js";
					script.onload = resolve;
					script.onerror = reject;
					document.body.appendChild(script);
				});

				const go = new window.Go();
				const result = await WebAssembly.instantiateStreaming(fetch("/wasm/tiger.wasm"), go.importObject);
				go.run(result.instance).catch((err) => {
					console.error("Go runtime error:", err);
				});

				for (let attempt = 0; attempt < 50 && typeof window.tigerRun !== "function"; attempt += 1) {
					await new Promise((resolve) => setTimeout(resolve, 10));
				}

				if (typeof window.tigerRun !== "function") {
					throw new Error("Tiger WASM runtime did not initialize.");
				}

				goLoaded.current = true;

				setOutput("Engine loaded. Run code.");
				setIsReady(true);
			} catch (err) {
				console.error("Failed to load engine:", err);
				setOutput("Failed to load WASM engine.");
			}
		};

		loadEngine();
	}, []);

	const runTiger = () => {
		try {
			if (!goLoaded.current || typeof window.tigerRun !== "function") {
				setOutput("Go engine not ready.");
				return;
			}
			const result = window.tigerRun(code);
			setOutput(result.error || result.output || "");
		} catch (err) {
			console.error("Runtime error:", err);
			setOutput(`Runtime error:\n${err}`);
		}
	};

	const lineNumbers = code.split("\n").map((_, index) => index + 1);

	const syncEditorScroll = (event) => {
		const editor = event.currentTarget;
		const highlight = editor.previousElementSibling;
		const lineNumbers = editor.parentElement.firstElementChild;
		if (highlight) {
			highlight.scrollTop = editor.scrollTop;
			highlight.scrollLeft = editor.scrollLeft;
		}
		if (lineNumbers) lineNumbers.scrollTop = editor.scrollTop;
	};

	const highlightedCode = tokenize(code);

	return (
		<HelmetProvider>
			<main className="tiger-page">
				<Tab title={t("tiger.title")} />
				<header className="tiger-hero">
					<div className="tiger-hero-grid" aria-hidden="true"></div>
					<div className="tiger-hero-copy">
						<div className="tiger-kicker"><span>TG</span> CUSTOM_LANGUAGE / WASM</div>
						<h1>{t("tiger.title")}</h1>
						<p>{t("tiger.description")}</p>
						<a href={l.tiger} target="_blank" rel="noopener noreferrer" className="tiger-repository-link">
							<FiGithub /><span>{t("tiger.more_info2")}</span><FiArrowUpRight />
						</a>
					</div>
					<div className="tiger-specs" aria-hidden="true">
						<div><span>RUNTIME</span><strong>GO / WASM</strong></div>
						<div><span>MODE</span><strong>INTERPRETED</strong></div>
						<div><span>SAMPLES</span><strong>{String(tigerSamples.length).padStart(2, "0")}</strong></div>
						<FiCpu />
					</div>
				</header>

				<section className="tiger-workspace" aria-label={t("tiger.title")}>
					<header className="tiger-toolbar">
						<div className="tiger-file-tab" title={t("tiger.tiger_code")}>
							<span className="tiger-file-mark" aria-hidden="true">T</span>
							<span>{selectedSample}</span>
							<span className={`tiger-engine-status ${isReady ? "is-ready" : ""}`}>
								<i></i>{isReady ? "ENGINE ONLINE" : "ENGINE LOADING"}
							</span>
						</div>
						<div className="tiger-toolbar-actions">
							<label className="tiger-sample-picker">
								<span>Example files</span>
								<select
									value={selectedSample}
									onChange={(event) => loadSample(event.target.value)}
									aria-label="Example files"
								>
									{tigerSamples.map((sampleName) => (
										<option key={sampleName} value={sampleName}>{sampleName}</option>
									))}
								</select>
							</label>
							<button
								type="button"
								className="tiger-run-button"
								onClick={runTiger}
								disabled={!isReady}
							>
								<FaPlay aria-hidden="true" />
								<span>{t("tiger.run_tiger")}</span>
							</button>
						</div>
					</header>

					<div className="tiger-compiler">
						<div className="tiger-editor-panel">
							<div className="tiger-line-numbers" aria-hidden="true">
								{lineNumbers.map((lineNumber) => (
									<span key={lineNumber}>{lineNumber}</span>
								))}
							</div>
							<pre className="tiger-code-highlight" aria-hidden="true">
								<code>
									{highlightedCode.map(({ text, kind }, index) => (
										kind === "plain"
											? <span key={index}>{text}</span>
											: <span key={index} className={`token-${kind}`}>{text}</span>
									))}
								</code>
							</pre>
							<textarea
								id="tiger-code"
								className="tiger-code-editor"
								ref={codeEditorRef}
								value={code}
								onChange={(event) => setCode(event.target.value)}
								onScroll={syncEditorScroll}
								aria-label={t("tiger.tiger_code")}
								spellCheck="false"
								wrap="off"
							/>
						</div>

						<section className="tiger-output-panel" aria-labelledby="tiger-output-title">
							<h2 id="tiger-output-title">{t("tiger.output")}</h2>
							<pre className="tiger-output" tabIndex="0">{output}</pre>
						</section>
					</div>
				</section>
			</main>
		</HelmetProvider>
	);
};

export default Tiger;
