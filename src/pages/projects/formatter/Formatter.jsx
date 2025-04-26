import React, { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container, Form, Button } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/themes/prism-tomorrow.css";
import l from "@/assets/links/links.json";
import "./Formatter.css";

const Formatter = () => {
	const { t } = useLang();

	const [input, setInput] = useState("");
	const [formatMode, setFormatMode] = useState("auto");
	const [wasmReady, setWasmReady] = useState(false);
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "/wasm_exec.js";
		script.onload = () => {
			if (typeof window.Go !== "function") {
				console.error("wasm_exec.js loaded but window.Go is not defined.");
				return;
			}

			const go = new window.Go();
			WebAssembly.instantiateStreaming(fetch("/formatter-go.wasm"), go.importObject)
				.then((result) => {
					go.run(result.instance);
					setWasmReady(true);
				})
				.catch((err) => {
					console.error("WASM failed to load:", err);
				});
		};
		script.onerror = () => {
			console.error("Failed to load wasm_exec.js");
		};
		document.body.appendChild(script);
	}, []);

	const handleFormat = () => {
		if (!wasmReady || typeof window.formatJSON !== "function") {
			return;
		}

		if (input.length > 1000000) { // 1MB limit
			setError("Input too large (max 1MB allowed).");
			return;
		}

		setError(""); // clear old errors

		let raw = input;
		if (formatMode === "json") raw = "///force:json///\n" + raw;
		if (formatMode === "yaml") raw = "///force:yaml///\n" + raw;

		try {
			const result = window.formatJSON(raw);
			setInput(result); // only if success
		} catch (err) {
			console.error("Error formatting input:", err);

			// Don't touch the input box! Only show the error
			if (formatMode === "yaml") {
				setError("Invalid YAML");
			} else {
				setError("Invalid JSON");
			}
		}
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(input).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	};

	const highlight = (code) => {
		if (formatMode === "yaml") {
			return Prism.highlight(code, Prism.languages.yaml, "yaml");
		}
		return Prism.highlight(code, Prism.languages.json, "json");
	};

	return (
		<HelmetProvider>
			<Container>
				<Tab title={t("formatter.title")} />
				<PageTitle title={t("formatter.title")} />

				<p>{t("formatter.description")}</p>
				<p>
					{t("formatter.more_info1")}{" "}
					<a href={l.formatter} target="_blank" rel="noopener noreferrer">
						{t("formatter.more_info2")}
					</a>.
				</p>

				<Form.Group>
					<Form.Label>{t("formatter.format_as")}</Form.Label>
					<Form.Select value={formatMode} onChange={(e) => setFormatMode(e.target.value)}>
						<option value="auto">{t("formatter.auto_detect")}</option>
						<option value="json">JSON</option>
						<option value="yaml">YAML</option>
					</Form.Select>
				</Form.Group>

				{/* THIS is the red error message placed between dropdown and editor */}
				{error && (
					<div className="text-danger mt-2" style={{ fontWeight: "bold" }}>
						{error}
					</div>
				)}

				<div className="output-container mt-3 position-relative">
					<Button className="copy-button" variant="secondary" size="sm" onClick={handleCopy}>
						📋 {copied ? "Copied!" : "Copy"}
					</Button>

					<Editor
						value={input}
						onValueChange={setInput}
						highlight={highlight}
						padding={15}
						style={{
							backgroundColor: "#222",
							color: "#f8f8f2",
							fontFamily: "monospace",
							fontSize: 16,
							minHeight: "400px",
							borderRadius: "6px",
							overflowX: "auto",
						}}
					/>
				</div>

				<Button className="mt-3" onClick={handleFormat}>
					{t("formatter.format")}
				</Button>
			</Container>
		</HelmetProvider>
	);
};

export default Formatter;
