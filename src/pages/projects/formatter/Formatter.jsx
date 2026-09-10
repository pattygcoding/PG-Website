import React, { useEffect, useRef, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container } from "react-bootstrap";
import { FaMagic } from "react-icons/fa";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import { CopyButton } from "@/components/copy-button";
import { useLang } from "@/lang/languageContext";
import l from "@/assets/links/links.json";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "./Formatter.css";

const jsonSamples = [
	"simple_object.json",
	"array_of_users.json",
	"nested_config.json",
	"minified.json",
];

const yamlSamples = [
	"simple_config.yaml",
	"list_example.yaml",
	"nested_structure.yaml",
	"multi_document.yaml",
];

const pills = [
	{ value: "auto", labelKey: "formatter.auto_detect" },
	{ value: "json", label: "JSON" },
	{ value: "yaml", label: "YAML" },
];

const Formatter = () => {
	const { t } = useLang();

	const [code, setCode] = useState("");
	const [formatMode, setFormatMode] = useState("auto");
	const [selectedJsonSample, setSelectedJsonSample] = useState("");
	const [selectedYamlSample, setSelectedYamlSample] = useState("");
	const [output, setOutput] = useState(t("formatter.loading"));
	const [isReady, setIsReady] = useState(false);
	const codeEditorRef = useRef(null);

	const goLoaded = useRef(false);

	const loadSample = async (type, sampleName) => {
		if (type === "json") {
			setSelectedJsonSample(sampleName);
			setSelectedYamlSample("");
		} else {
			setSelectedYamlSample(sampleName);
			setSelectedJsonSample("");
		}
		setFormatMode(type);

		try {
			const response = await fetch(`/assets/formatter_samples/${type}/${sampleName}`);
			if (!response.ok) {
				throw new Error(`Unable to load ${sampleName}.`);
			}
			setCode(await response.text());
		} catch (err) {
			console.error("Failed to load formatter sample:", err);
			setOutput(`Failed to load ${sampleName}.`);
		}
	};

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
				const result = await WebAssembly.instantiateStreaming(fetch("/wasm/formatter.wasm"), go.importObject);
				go.run(result.instance).catch((err) => {
					console.error("Go runtime error:", err);
				});

				for (let attempt = 0; attempt < 50 && typeof window.formatInput !== "function"; attempt += 1) {
					await new Promise((resolve) => setTimeout(resolve, 10));
				}

				if (typeof window.formatInput !== "function") {
					throw new Error("Formatter did not initialize");
				}

				goLoaded.current = true;
				setOutput(t("formatter.waiting_for_input"));
				setIsReady(true);
			} catch (err) {
				console.error("Failed to load formatter engine:", err);
				setOutput(t("formatter.load_failed"));
			}
		};

		loadEngine();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleFormat = () => {
		if (!goLoaded.current || typeof window.formatInput !== "function") {
			setOutput(t("formatter.load_failed"));
			return;
		}

		if (!code.trim()) {
			setOutput(t("formatter.empty_input"));
			return;
		}

		if (code.length > 1000000) {
			setOutput(t("formatter.too_large"));
			return;
		}

		try {
			setOutput(window.formatInput(code, formatMode));
		} catch (err) {
			setOutput(`Formatting failed: ${err.message}`);
		}
	};

	const highlightLanguage = formatMode === "yaml" ? "yaml" : "json";
	const highlightedCode = Prism.highlight(
		code,
		Prism.languages[highlightLanguage],
		highlightLanguage
	);
	const highlightedOutput = Prism.highlight(
		output,
		Prism.languages[highlightLanguage],
		highlightLanguage
	);
	const lineNumbers = code.split("\n").map((_, index) => index + 1);

	const syncEditorScroll = (event) => {
		const editor = event.currentTarget;
		const highlight = editor.previousElementSibling;
		const numbers = editor.parentElement.firstElementChild;
		if (highlight) {
			highlight.scrollTop = editor.scrollTop;
			highlight.scrollLeft = editor.scrollLeft;
		}
		if (numbers) numbers.scrollTop = editor.scrollTop;
	};

	return (
		<HelmetProvider>
			<Container className="formatter-page">
				<Tab title={t("formatter.title")} />
				<PageTitle title={t("formatter.title")} />

				<section className="formatter-description">
					<p>{t("formatter.description")}</p>
					<p>
						{t("formatter.more_info1")}{" "}
						<a href={l.formatter} target="_blank" rel="noopener noreferrer">
							{t("formatter.more_info2")}
						</a>.
					</p>
				</section>

				<section className="formatter-workspace" aria-label={t("formatter.title")}>
					<header className="formatter-toolbar">
						<div className="formatter-pills" role="group" aria-label={t("formatter.format_as")}>
							{pills.map((pill) => (
								<button
									key={pill.value}
									type="button"
									className={`formatter-pill${formatMode === pill.value ? " active" : ""}`}
									onClick={() => setFormatMode(pill.value)}
								>
									{pill.label || t(pill.labelKey)}
								</button>
							))}
						</div>
						<div className="formatter-toolbar-actions">
							<label className="formatter-sample-picker">
								<span>{t("formatter.json_examples")}</span>
								<select
									value={selectedJsonSample}
									onChange={(event) => loadSample("json", event.target.value)}
									aria-label={t("formatter.json_examples")}
								>
									<option value="" disabled>{t("formatter.json_examples")}</option>
									{jsonSamples.map((sampleName) => (
										<option key={sampleName} value={sampleName}>{sampleName}</option>
									))}
								</select>
							</label>
							<label className="formatter-sample-picker">
								<span>{t("formatter.yaml_examples")}</span>
								<select
									value={selectedYamlSample}
									onChange={(event) => loadSample("yaml", event.target.value)}
									aria-label={t("formatter.yaml_examples")}
								>
									<option value="" disabled>{t("formatter.yaml_examples")}</option>
									{yamlSamples.map((sampleName) => (
										<option key={sampleName} value={sampleName}>{sampleName}</option>
									))}
								</select>
							</label>
							<button
								type="button"
								className="formatter-run-button"
								onClick={handleFormat}
								disabled={!isReady}
							>
								<FaMagic aria-hidden="true" />
								<span>{t("formatter.format")}</span>
							</button>
						</div>
					</header>

					<div className="formatter-compiler">
						<div className="formatter-editor-panel">
							<div className="formatter-line-numbers" aria-hidden="true">
								{lineNumbers.map((lineNumber) => (
									<span key={lineNumber}>{lineNumber}</span>
								))}
							</div>
							<pre
								className="formatter-code-highlight"
								aria-hidden="true"
								dangerouslySetInnerHTML={{ __html: highlightedCode }}
							/>
							<textarea
								id="formatter-code"
								className="formatter-code-editor"
								ref={codeEditorRef}
								value={code}
								onChange={(event) => setCode(event.target.value)}
								onScroll={syncEditorScroll}
								aria-label={t("formatter.input_code")}
								spellCheck="false"
								wrap="off"
							/>
						</div>

						<section className="formatter-output-panel" aria-labelledby="formatter-output-title">
							<h2 id="formatter-output-title">{t("formatter.output")}</h2>
							<CopyButton textToCopy={output} />
							<pre
								className="formatter-output"
								tabIndex="0"
								dangerouslySetInnerHTML={{ __html: highlightedOutput }}
							/>
						</section>
					</div>
				</section>
			</Container>
		</HelmetProvider>
	);
};

export default Formatter;


