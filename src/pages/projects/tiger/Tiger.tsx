import React, { useEffect, useRef, useState } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import { RepoButton } from "@/components/repo-button";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import l from '@/assets/links/links.json';
import { tokenize } from "./highlight";
import { createInputChannel, type InputChannel } from "./inputChannel";
import "./Tiger.css";
import "@/components/page-shell/PageShell.css";

const tigerSamples = [
	"hello_world.tg",
	"bank_ledger.tg",
	"connect_four.tg",
	"expression_calculator.tg",
	"file_journal.tg",
	"functional_toolkit.tg",
	"game_of_life.tg",
	"interactive_quiz.tg",
	"inventory_report.tg",
	"matrix_lab.tg",
	"shape_gallery.tg",
	"task_scheduler.tg",
	"text_studio.tg",
	"turing_machine.tg",
	"vending_machine.tg",
];

const statusLabels: Record<string, string> = {
	loading: "ENGINE LOADING",
	ready: "ENGINE ONLINE",
	running: "RUNNING",
	input: "AWAITING INPUT",
	unavailable: "ENGINE OFFLINE",
};

const Tiger = () => {
	const { t } = useLang();

	const [code, setCode] = useState("");
	const [selectedSample, setSelectedSample] = useState("hello_world.tg");
	const [output, setOutput] = useState("Loading engine...");
	const [error, setError] = useState("");
	const [status, setStatus] = useState("loading");
	const [inputValue, setInputValue] = useState("");
	const codeEditorRef = useRef<HTMLTextAreaElement>(null);
	const outputRef = useRef<HTMLPreElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const workerRef = useRef<Worker | null>(null);
	const inputChannelRef = useRef<InputChannel | null>(null);

	const isRunning = status === "running" || status === "input";
	const isReady = status !== "loading" && status !== "unavailable";

	const loadSample = async (sampleName: string) => {
		setSelectedSample(sampleName);

		try {
			const response = await fetch(`/assets/tiger_samples/${sampleName}`);
			if (!response.ok) {
				throw new Error(`Unable to load ${sampleName}.`);
			}
			setCode(await response.text());
		} catch (err) {
			console.error("Failed to load Tiger sample:", err);
			setError(`Failed to load ${sampleName}.`);
		}
	};

	useEffect(() => {
		loadSample("hello_world.tg");
	}, []);

	const startWorker = () => {
		workerRef.current?.terminate();
		setStatus("loading");
		setInputValue("");
		inputChannelRef.current = null;
		// Classic worker (no `{ type: "module" }`) so older mobile browsers that
		// lack module-worker support still run the engine. The `?v=` tag busts
		// the GitHub Pages cache for the un-hashed runtime files.
		const worker = new Worker("/wasm/tiger-worker.js?v=4");
		workerRef.current = worker;
		const fail = (message?: string) => {
			if (workerRef.current !== worker) return;
			setError(message || "Failed to load WASM engine.");
			setStatus("unavailable");
			worker.terminate();
		};
		worker.onmessage = ({ data }) => {
			if (workerRef.current !== worker) return;
			if (data.type === "ready") {
				inputChannelRef.current = createInputChannel(data.shared);
				setOutput((current) => current === "Loading engine..." ? "Engine loaded. Run code." : current);
				setStatus("ready");
			} else if (data.type === "output") {
				setOutput((current) => current + data.text);
			} else if (data.type === "input") {
				setStatus("input");
			} else if (data.type === "result") {
				setError(data.error || "");
				setStatus("ready");
			} else if (data.type === "fatal") {
				fail(data.error);
			}
		};
		worker.onerror = (event) => fail(event.message);
	};

	useEffect(() => {
		startWorker();
		return () => {
			workerRef.current?.terminate();
			workerRef.current = null;
			inputChannelRef.current = null;
		};
	}, []);

	// The Rust runtime answers input() through a SharedArrayBuffer, which browsers
	// only expose to cross-origin-isolated pages. The dev server sends COOP/COEP;
	// GitHub Pages cannot, so register a worker that adds them and reload once.
	// Scope is "/", not "/tiger": the page is served by a single controlling
	// worker, and that worker only sees requests whose URL is inside its scope.
	// The runtime worker lives at /wasm/, which the same service worker has to
	// cover so it can add the COEP header that a dedicated worker needs when its
	// owning document is isolated. Without isolation the runtime still runs;
	// input() just reports that no stream is connected.
	useEffect(() => {
		if (!window.isSecureContext || !("serviceWorker" in navigator)) return;
		let cancelled = false;
		const ensureIsolation = async () => {
			const registrations = await navigator.serviceWorker.getRegistrations();
			// An earlier "/tiger"-scoped registration cannot see the /wasm
			// runtime files, so replace it with the "/"-scoped one.
			const narrow = registrations.filter((registration) => new URL(registration.scope).pathname === "/tiger");
			if (narrow.length) await Promise.all(narrow.map((registration) => registration.unregister()));

			const root = registrations.find((registration) =>
				new URL(registration.scope).pathname === "/" && registration.active);
			if (!root) await navigator.serviceWorker.register("/coi-serviceworker.js", { scope: "/" });
			await navigator.serviceWorker.ready;
			if (cancelled) return;

			if (!window.crossOriginIsolated) {
				if (sessionStorage.getItem("tiger-coi-reload")) return;
				sessionStorage.setItem("tiger-coi-reload", "1");
				window.location.reload();
				return;
			}
			// Already isolated: reload the runtime worker so it runs under the
			// controller that can annotate its /wasm requests.
			if (narrow.length) startWorker();
		};
		ensureIsolation().catch(() => { /* Isolation is optional; input() degrades to "no stream". */ });
		return () => { cancelled = true; };
	}, []);

	useEffect(() => {
		if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
	}, [output, status, error]);

	useEffect(() => {
		if (status === "input") inputRef.current?.focus({ preventScroll: true });
	}, [status]);

	const runTiger = () => {
		if (!workerRef.current || status !== "ready") return;
		setOutput("");
		setError("");
		setStatus("running");
		workerRef.current.postMessage({ type: "run", source: code, filename: selectedSample });
	};

	const stopTiger = () => {
		startWorker();
		setError("Execution stopped.");
	};

	// Enter sends the line; Ctrl+D closes input, matching the Tiger playground.
	const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		const endOfInput = event.ctrlKey && (event.key === "d" || event.key === "D");
		if (event.key !== "Enter" && !endOfInput) return;
		event.preventDefault();
		const channel = inputChannelRef.current;
		if (endOfInput) {
			setOutput((current) => current + "^D\n");
			channel?.end();
		} else {
			setOutput((current) => current + `${inputValue}\n`);
			channel?.write(inputValue);
		}
		setInputValue("");
		setStatus("running");
	};

	const lineNumbers = code.split("\n").map((_, index) => index + 1);

	const syncEditorScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
		const editor = event.currentTarget;
		const highlight = editor.previousElementSibling as HTMLElement | null;
		const lineNumbers = editor.parentElement?.firstElementChild as HTMLElement | null;
		if (highlight) {
			highlight.scrollTop = editor.scrollTop;
			highlight.scrollLeft = editor.scrollLeft;
		}
		if (lineNumbers) lineNumbers.scrollTop = editor.scrollTop;
	};

	const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key !== "Tab") return;
		event.preventDefault();

		const editor = event.currentTarget;
		const { selectionStart, selectionEnd, value } = editor;
		const indent = "    ";

		if (event.shiftKey) {
			const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
			if (!value.slice(lineStart, lineStart + indent.length).match(/^ {1,4}/)) return;
			const removed = value.slice(lineStart).match(/^ {1,4}/)![0];
			const nextValue = value.slice(0, lineStart) + value.slice(lineStart + removed.length);
			setCode(nextValue);
			requestAnimationFrame(() => {
				editor.selectionStart = selectionStart - removed.length;
				editor.selectionEnd = selectionEnd - removed.length;
			});
			return;
		}

		const nextValue = value.slice(0, selectionStart) + indent + value.slice(selectionEnd);
		setCode(nextValue);
		requestAnimationFrame(() => {
			editor.selectionStart = editor.selectionEnd = selectionStart + indent.length;
		});
	};

	const highlightedCode = tokenize(code);

	return (
		<>
			<main className="tiger-lab portfolio-shell">
				<Tab title={t("tiger.title")} />
				<header className="page-heading">
						<div className="page-eyebrow"><span>Tiger</span></div>
						<h1>{t("tiger.title")}</h1>
						<p>{t("tiger.description")}</p>
						<div className="tiger-repo-actions">
							<RepoButton href={l.tiger} />
							<RepoButton href={l.tiger_legacy_go} label={t("tiger.legacy_repo")} variant="secondary" />
						</div>
				</header>
				<div className="tiger-runtime-summary"><span>Rust / WebAssembly</span><span>Interpreted</span><span>{tigerSamples.length} .tg</span></div>

				<section className="tiger-workspace" aria-label={t("tiger.title")}>
					<header className="tiger-toolbar">
						<div className="tiger-file-tab" title={t("tiger.tiger_code")}>
							<span className="tiger-file-mark" aria-hidden="true">T</span>
							<span>{selectedSample}</span>
							<span className={`tiger-engine-status is-${status}`}>
								{statusLabels[status]}
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
							{isRunning ? (
								<button
									type="button"
									className="tiger-run-button tiger-stop-button"
									onClick={stopTiger}
								>
									<FaStop aria-hidden="true" />
									<span>{t("tiger.stop")}</span>
								</button>
							) : (
								<button
									type="button"
									className="tiger-run-button"
									onClick={runTiger}
									disabled={!isReady}
								>
									<FaPlay aria-hidden="true" />
									<span>{t("tiger.run_tiger")}</span>
								</button>
							)}
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
								onKeyDown={handleEditorKeyDown}
								aria-label={t("tiger.tiger_code")}
								spellCheck="false"
								wrap="off"
							/>
						</div>

						<section className="tiger-output-panel" aria-labelledby="tiger-output-title">
							<h2 id="tiger-output-title">{t("tiger.output")}</h2>
							<pre
								ref={outputRef}
								className="tiger-output"
								role="log"
								aria-live="polite"
								aria-labelledby="tiger-output-title"
								tabIndex={0}
								onClick={() => inputRef.current?.focus()}
							>
								{output}
								{status === "input" && (
									<input
										ref={inputRef}
										className="tiger-stdin"
										value={inputValue}
										onChange={(event) => setInputValue(event.target.value)}
										onKeyDown={handleInputKeyDown}
										aria-label={t("tiger.program_input")}
										autoComplete="off"
										spellCheck="false"
									/>
								)}
								{error && <span className="tiger-output-error">{output && !output.endsWith("\n") ? "\n" : ""}{error}</span>}
							</pre>
						</section>
					</div>
				</section>
			</main>
		</>
	);
};

export default Tiger;
