import React, { useEffect, useRef, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container, Form, Button } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import { CodeBox } from "@/components/code-box";
import { useLang } from "@/lang/languageContext";
import l from '@/assets/links/links.json';
import "./Tiger.css";

const Tiger = () => {
	const { t } = useLang();

	const [code, setCode] = useState(`let name = "Tiger"\nprint name`);
	const [output, setOutput] = useState("Loading engine...");
	const [isReady, setIsReady] = useState(false);

	const goLoaded = useRef(false);

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
				const result = await WebAssembly.instantiateStreaming(fetch("/wasm/tiger_go.wasm"), go.importObject);
				go.run(result.instance);
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
			if (!goLoaded.current || !window.evalTiger) {
				setOutput("Go engine not ready.");
				return;
			}
			const result = window.evalTiger(code);
			setOutput(result);
		} catch (err) {
			console.error("Runtime error:", err);
			setOutput(`Runtime error:\n${err}`);
		}
	};

	return (
		<HelmetProvider>
			<Container>
				<Tab title={t("tiger.title")} />
				<PageTitle title={t("tiger.title")} />

				<p>{t("tiger.description")}</p>
				<p>
					{t("tiger.more_info1")}{" "}
					<a href={l.tiger} target="_blank" rel="noopener noreferrer">
						{t("tiger.more_info2")}
					</a>.
				</p>

				<Form.Group controlId="code" className="mt-3">
					<Form.Label>{t("tiger.tiger_code")}</Form.Label>
					<CodeBox 
						initialCode={`let name = "Tiger"\nprint name`}
						language="python"
						onCodeChange={setCode}
					/>
				</Form.Group>

				<Button className="mt-3" onClick={runTiger} disabled={!isReady}>
					{t("tiger.run_tiger")}
				</Button>

				<Form.Group controlId="output" className="mt-4">
					<Form.Label>{t("tiger.output")}</Form.Label>
					<pre className="tiger-output">{output}</pre>
				</Form.Group>
			</Container>
		</HelmetProvider>
	);
};

export default Tiger;
