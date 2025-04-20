import React, { useEffect, useRef, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container, Form, Button } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import t from '@/assets/lang/en_us.json';
import l from '@/assets/links/links.json';
import "./Tiger.css";

const Tiger = () => {
	const [engine, setEngine] = useState("go");
	const [code, setCode] = useState(`let name = "Tiger"\nprint name`);
	const [output, setOutput] = useState("Loading engines...");
	const [isReady, setIsReady] = useState(false);

	const goLoaded = useRef(false);

	useEffect(() => {
		const loadEngines = async () => {
			try {
				await new Promise((resolve, reject) => {
					const script = document.createElement("script");
					script.src = "/wasm_exec.js";
					script.onload = resolve;
					script.onerror = reject;
					document.body.appendChild(script);
				});

				const go = new window.Go();
				const result = await WebAssembly.instantiateStreaming(fetch("/main_go.wasm"), go.importObject);
				go.run(result.instance);
				goLoaded.current = true;

				const rustModule = document.createElement("script");
				rustModule.type = "module";
				rustModule.innerHTML = `
					import init, { eval_tiger } from "/rust/pkg-rust/tiger.js";
					init().then(() => {
						window.evalTigerRust = eval_tiger;
						window.evalTigerRustReady = true;
					});
				`;
				document.body.appendChild(rustModule);

				setOutput("Engines loaded. Select one and run code.");
				setIsReady(true);
			} catch (err) {
				console.error("Failed to load engines:", err);
				setOutput("Failed to load WASM engines.");
			}
		};

		loadEngines();
	}, []);


	const runTiger = () => {
		try {
			if (engine === "go") {
				if (!goLoaded.current || !window.evalTiger) {
					setOutput("Go engine not ready.");
					return;
				}
				const result = window.evalTiger(code);
				setOutput(result);
			} else {
				if (!window.evalTigerRustReady) {
					setOutput("Rust engine not ready.");
					return;
				}
				const result = window.evalTigerRust(code);
				setOutput(result);
			}
		} catch (err) {
			console.error("Runtime error:", err);
			setOutput(`Runtime error:\n${err}`);
		}
	};

	return (
		<HelmetProvider>
			<Container>
				<Tab title={t.tiger.title} />
				<PageTitle title={t.tiger.title} />
				
				<p>{t.tiger.description}</p>
				<p>
				{t.tiger.more_info1}{" "}
					<a
						href={l.tiger}
						target="_blank"
						rel="noopener noreferrer"
					>
						{t.tiger.more_info2}
					</a>.
				</p>
				<Form.Group controlId="engine" className="mt-4">
					<Form.Label>Select Engine:</Form.Label>
					<Form.Select value={engine} onChange={(e) => setEngine(e.target.value)}>
						<option value="go">Go</option>
						<option value="rust">Rust</option>
					</Form.Select>
				</Form.Group>

				<Form.Group controlId="code" className="mt-3">
					<Form.Label>Tiger Code:</Form.Label>
					<Form.Control
						as="textarea"
						rows={6}
						value={code}
						onChange={(e) => setCode(e.target.value)}
					/>
				</Form.Group>

				<Button className="mt-3" onClick={runTiger} disabled={!isReady}>
					Run Tiger
				</Button>

				<Form.Group controlId="output" className="mt-4">
					<Form.Label>Output:</Form.Label>
					<pre className="tiger-output">{output}</pre>
				</Form.Group>
			</Container>
		</HelmetProvider>
	);
};

export default Tiger;
