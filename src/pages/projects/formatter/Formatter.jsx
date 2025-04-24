import React, { useEffect, useRef, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container, Form, Button } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import l from "@/assets/links/links.json";
import "./Formatter.css";

const Formatter = () => {
	const { t } = useLang();

	const inputRef = useRef(null);
	const [output, setOutput] = useState("Waiting for input...");
	const [formatMode, setFormatMode] = useState("auto");
	const [wasmReady, setWasmReady] = useState(false);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "/wasm_exec.js";
		script.onload = () => {
			if (typeof window.Go !== "function") {
				setOutput("wasm_exec.js loaded, but window.Go is not defined.");
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
					setOutput("WASM failed to load: " + err.message);
				});
		};
		script.onerror = () => {
			setOutput("Failed to load wasm_exec.js");
		};
		document.body.appendChild(script);
	}, []);

	const handleFormat = () => {
		if (!wasmReady || typeof window.formatJSON !== "function") {
			setOutput("WASM not ready.");
			return;
		}

		let input = inputRef.current.value;
		if (formatMode === "json") input = "///force:json///\n" + input;
		if (formatMode === "yaml") input = "///force:yaml///\n" + input;

		try {
			const result = window.formatJSON(input);
			setOutput(result);
		} catch (err) {
			setOutput("Error formatting input.");
		}
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(output).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
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

				<Form.Group className="mt-3">
					<Form.Control
						as="textarea"
						rows={10}
						ref={inputRef}
						placeholder="Paste JSON or YAML here..."
						className="bg-dark text-success"
					/>
				</Form.Group>

				<Button className="mt-3" onClick={handleFormat}>
					{t("formatter.format")}
				</Button>

				<div className="output-container mt-3">
					<pre className="bg-dark text-success p-3 position-relative">
						<button className="copy-button" onClick={handleCopy}>
							📋 {copied ? "Copied!" : "Copy"}
						</button>
						{output}
					</pre>
				</div>

			</Container>
		</HelmetProvider>
	);
};

export default Formatter;
