import React, { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container, Form, Button } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import { CodeBox } from "@/components/code-box";
import l from "@/assets/links/links.json";
import "./Formatter.css";

const Formatter = () => {
	const { t } = useLang();

	const [input, setInput] = useState("");
	const [formatMode, setFormatMode] = useState("auto");
	const [wasmReady, setWasmReady] = useState(false);
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

		if (input.length > 1000000) {
			setError("Input too large (max 1MB allowed).");
			return;
		}

		setError("");

		let raw = input;
		if (formatMode === "json") raw = "///force:json///\n" + raw;
		if (formatMode === "yaml") raw = "///force:yaml///\n" + raw;

		try {
			const result = window.formatJSON(raw);

			if (result.startsWith("Invalid")) {
				setError(result);
				return;
			}

			setInput(result);
		} catch (err) {
			console.error("Error formatting input:", err);
			setError(formatMode === "yaml" ? "Invalid YAML" : "Invalid JSON");
		}
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

				{error && (
					<div className="text-danger mt-2" style={{ fontWeight: "bold" }}>
						{error}
					</div>
				)}

				<CodeBox
					initialCode={input}
					language={formatMode === "yaml" ? "yaml" : "json"}
					onCodeChange={setInput}
				/>


				<Button className="mt-3" onClick={handleFormat}>
					{t("formatter.format")}
				</Button>
			</Container>
		</HelmetProvider>
	);
};

export default Formatter;
