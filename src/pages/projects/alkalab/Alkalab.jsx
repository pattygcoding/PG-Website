import React, { useCallback, useEffect, useRef, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { RepoButton } from "@/components/repo-button";
import { projectNumber } from "@/menu/projectCatalog";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import l from "@/assets/links/links.json";
import "@/components/page-shell/PageShell.css";
import "./Alkalab.css";

const WIDTH = 320;
const HEIGHT = 200;
// wasm-bindgen glue served from the public folder, next to alkalab.wasm.
const MODULE_URL = "/wasm/alkalab.js";

// Keyboard quick-pick palette (1-9 and 0), matching the original front end.
const HOTKEYS = ["Sand", "Water", "Stone", "Wood", "Fire", "Oil", "Sodium", "Lava", "Acid", "TNT"];

// Demo scenes. Each takes the engine and an element-id lookup so the palette
// generated from the Rust property table stays the single source of truth.
const PRESETS = [
	{
		key: "sodium_water",
		build(engine, idOf) {
			engine.paint_rect(20, 150, 300, 196, idOf("Water"));
			engine.paint(60, 120, 3, idOf("Sodium"));
			engine.paint(160, 118, 3, idOf("Sodium"));
			engine.paint(260, 120, 3, idOf("Sodium"));
			engine.paint(110, 130, 2, idOf("Potassium"));
			engine.paint(210, 130, 2, idOf("Lithium"));
		},
	},
	{
		key: "volcano",
		build(engine, idOf) {
			engine.paint_rect(0, 188, WIDTH - 1, HEIGHT - 1, idOf("Stone"));
			engine.paint_line(30, 188, 160, 118, 7, idOf("Stone"));
			engine.paint_line(290, 188, 160, 118, 7, idOf("Stone"));
			engine.paint_rect(120, 150, 200, 188, idOf("Lava"));
			engine.paint_rect(0, 40, WIDTH - 1, 46, idOf("Water"));
			engine.paint_rect(120, 60, 200, 72, idOf("Water"));
		},
	},
	{
		key: "density_column",
		build(engine, idOf) {
			engine.paint_rect(20, 180, 300, 197, idOf("Stone"));
			engine.paint_rect(40, 58, 280, 96, idOf("Oil"));
			engine.paint_rect(40, 24, 280, 56, idOf("Water"));
			engine.paint_rect(40, 2, 280, 22, idOf("Sand"));
			engine.paint(50, 110, 2, idOf("Mercury"));
			engine.paint(270, 110, 2, idOf("Mercury"));
		},
	},
	{
		key: "vine",
		build(engine, idOf) {
			engine.paint_rect(0, 186, WIDTH - 1, HEIGHT - 1, idOf("Sand"));
			engine.paint_rect(0, 178, WIDTH - 1, 186, idOf("Water"));
			for (let x = 24; x < WIDTH - 10; x += 36) {
				engine.paint(x, 176, 1, idOf("Plant"));
			}
		},
	},
	{
		key: "demolition",
		build(engine, idOf) {
			engine.paint_rect(80, 186, 240, 196, idOf("Stone"));
			engine.paint_rect(90, 120, 230, 186, idOf("Wood"));
			engine.paint_rect(120, 140, 200, 170, idOf("TNT"));
			engine.paint_rect(130, 150, 190, 160, idOf("Gunpowder"));
			engine.paint_rect(140, 96, 180, 112, idOf("Hydrogen"));
			engine.paint(160, 92, 2, idOf("Fire"));
		},
	},
	{
		key: "carbide_cannon",
		build(engine, idOf) {
			engine.paint_rect(0, 190, WIDTH - 1, HEIGHT - 1, idOf("Stone"));
			engine.paint_rect(60, 140, 260, 190, idOf("Water"));
			engine.paint_rect(120, 120, 200, 138, idOf("Carbide"));
			engine.paint_rect(0, 30, WIDTH - 1, 34, idOf("Stone"));
		},
	},
];

const Alkalab = () => {
	const { t } = useLang();

	// wasm + render plumbing (mutable, never triggers a re-render)
	const canvasRef = useRef(null);
	const engineRef = useRef(null);
	const wasmRef = useRef(null);
	const bufferRef = useRef(null);
	const imageDataRef = useRef(null);
	const rafRef = useRef(0);
	const idOfRef = useRef(() => undefined);
	const byNameRef = useRef(new Map());
	const logJsonRef = useRef(null);

	// input state mirrored into refs so the animation loop never reads stale values
	const paintingRef = useRef(false);
	const erasingRef = useRef(false);
	const lastCellRef = useRef(null);
	const selectedRef = useRef(null);
	const toolRef = useRef("paint");
	const brushRef = useRef(4);
	const shapeRef = useRef("circle");
	const speedRef = useRef(1);
	const runningRef = useRef(true);

	// UI state
	const [status, setStatus] = useState("loading");
	const [catalog, setCatalog] = useState([]);
	const [selected, setSelected] = useState(null);
	const [brush, setBrush] = useState(4);
	const [shape, setShape] = useState("circle");
	const [tool, setTool] = useState("paint");
	const [running, setRunning] = useState(true);
	const [speed, setSpeed] = useState(1);
	const [stats, setStats] = useState({ fps: 0, frame: 0, particles: 0, canUndo: false });
	const [log, setLog] = useState([]);

	useEffect(() => { selectedRef.current = selected; }, [selected]);
	useEffect(() => { toolRef.current = tool; }, [tool]);
	useEffect(() => { brushRef.current = brush; }, [brush]);
	useEffect(() => { shapeRef.current = shape; }, [shape]);
	useEffect(() => { speedRef.current = speed; }, [speed]);
	useEffect(() => { runningRef.current = running; }, [running]);

	// The wasm heap can grow, and growing detaches the old ArrayBuffer, so the
	// Uint8ClampedArray view has to be rebuilt whenever the buffer identity
	// changes. The view *is* wasm linear memory: no per-frame copies.
	const syncBuffer = useCallback(() => {
		const wasm = wasmRef.current;
		const engine = engineRef.current;
		if (!wasm || !engine) return null;
		if (wasm.memory.buffer !== bufferRef.current) {
			bufferRef.current = wasm.memory.buffer;
			const pixels = new Uint8ClampedArray(bufferRef.current, engine.pixel_ptr, engine.pixel_len);
			imageDataRef.current = new ImageData(pixels, engine.width, engine.height);
		}
		return imageDataRef.current;
	}, []);

	// --------------------------------------------------------------------
	// boot: load the wasm-bindgen glue from /wasm. The dynamic import carries
	// `webpackIgnore` so webpack leaves it as a native import and the module
	// keeps wasm-bindgen's own new URL('alkalab.wasm', import.meta.url).
	// --------------------------------------------------------------------
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const module = await import(/* webpackIgnore: true */ MODULE_URL);
				const wasm = await module.default();
				if (cancelled) return;
				wasmRef.current = wasm;
				const engine = new module.Engine(WIDTH, HEIGHT, (Math.random() * 0xffffffff) >>> 0);
				engineRef.current = engine;
				const entries = JSON.parse(engine.element_catalog());
				const map = new Map(entries.map((entry) => [entry.name, entry]));
				byNameRef.current = map;
				idOfRef.current = (name) => map.get(name)?.id;
				const initial = map.get("Sand") || entries[0] || null;
				selectedRef.current = initial;
				setCatalog(entries);
				setSelected(initial);
				setStatus("ready");
			} catch (error) {
				console.error("Failed to start Alkalab:", error);
				if (!cancelled) setStatus("runtime_failed");
			}
		})();
		return () => {
			cancelled = true;
			cancelAnimationFrame(rafRef.current);
			try { engineRef.current?.free(); } catch (error) { console.error(error); }
			engineRef.current = null;
		};
	}, []);

	// --------------------------------------------------------------------
	// the simulation + render loop
	// --------------------------------------------------------------------
	useEffect(() => {
		if (status !== "ready") return undefined;
		const canvas = canvasRef.current;
		const engine = engineRef.current;
		if (!canvas || !engine) return undefined;
		const ctx = canvas.getContext("2d", { alpha: false });
		let fps = 0;
		let last = performance.now();
		let countdown = 0;

		const frame = (now) => {
			const dt = now - last;
			last = now;
			if (dt > 0) fps = fps === 0 ? 1000 / dt : fps * 0.9 + (1000 / dt) * 0.1;
			if (runningRef.current) engine.step_n(speedRef.current);
			const imageData = syncBuffer();
			if (imageData) ctx.putImageData(imageData, 0, 0);
			const json = engine.reactions();
			if (json !== logJsonRef.current) {
				logJsonRef.current = json;
				setLog(JSON.parse(json));
			}
			if ((countdown -= 1) <= 0) {
				countdown = 10;
				setStats({ fps, frame: engine.frame, particles: engine.particle_count, canUndo: engine.can_undo });
			}
			rafRef.current = requestAnimationFrame(frame);
		};
		rafRef.current = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(rafRef.current);
	}, [status, syncBuffer]);

	// Brush size on the mouse wheel. Attached natively so preventDefault works.
	useEffect(() => {
		if (status !== "ready") return undefined;
		const canvas = canvasRef.current;
		if (!canvas) return undefined;
		const onWheel = (event) => {
			event.preventDefault();
			setBrush((value) => Math.max(0, Math.min(24, value + (event.deltaY < 0 ? 1 : -1))));
		};
		canvas.addEventListener("wheel", onWheel, { passive: false });
		return () => canvas.removeEventListener("wheel", onWheel);
	}, [status]);

	const selectElement = useCallback((entry) => {
		if (!entry) return;
		selectedRef.current = entry;
		setSelected(entry);
		setTool("paint");
	}, []);

	const cellFromEvent = useCallback((event) => {
		const canvas = canvasRef.current;
		const engine = engineRef.current;
		const rect = canvas.getBoundingClientRect();
		return {
			x: Math.round(((event.clientX - rect.left) / rect.width) * engine.width),
			y: Math.round(((event.clientY - rect.top) / rect.height) * engine.height),
		};
	}, []);

	const paintAt = useCallback((x, y) => {
		const engine = engineRef.current;
		const elementId = erasingRef.current ? 0 : (selectedRef.current?.id ?? 0);
		if (toolRef.current === "boom" && !erasingRef.current) {
			engine.detonate(x, y, brushRef.current + 3);
			return;
		}
		switch (shapeRef.current) {
			case "square":
				engine.paint_rect(x - brushRef.current, y - brushRef.current, x + brushRef.current, y + brushRef.current, elementId);
				break;
			case "spray":
				for (let i = 0; i < 10; i += 1) {
					const spread = brushRef.current * 1.6;
					engine.paint(
						Math.round(x + (Math.random() - 0.5) * spread * 2),
						Math.round(y + (Math.random() - 0.5) * spread * 2),
						Math.max(0, Math.round(brushRef.current / 2)),
						elementId,
					);
				}
				break;
			default:
				engine.paint(x, y, brushRef.current, elementId);
		}
	}, []);

	// Fast drags deliver sparse pointer events: walk the whole segment so a
	// stroke never has gaps in it.
	const strokeTo = useCallback((x, y) => {
		const last = lastCellRef.current;
		if (last) {
			const dx = x - last.x;
			const dy = y - last.y;
			const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
			for (let i = 1; i <= steps; i += 1) {
				paintAt(Math.round(last.x + (dx * i) / steps), Math.round(last.y + (dy * i) / steps));
			}
		} else {
			paintAt(x, y);
		}
		lastCellRef.current = { x, y };
	}, [paintAt]);

	const handlePointerDown = useCallback((event) => {
		const canvas = canvasRef.current;
		const engine = engineRef.current;
		if (!canvas || !engine) return;
		canvas.setPointerCapture(event.pointerId);
		paintingRef.current = true;
		erasingRef.current = event.button === 2 || (event.buttons & 2) === 2;
		lastCellRef.current = null;
		engine.snapshot(); // one snapshot per stroke => Ctrl+Z undoes the whole stroke
		setStats((value) => ({ ...value, canUndo: true }));
		const { x, y } = cellFromEvent(event);
		strokeTo(x, y);
		event.preventDefault();
	}, [cellFromEvent, strokeTo]);

	const handlePointerMove = useCallback((event) => {
		if (!paintingRef.current) return;
		const { x, y } = cellFromEvent(event);
		strokeTo(x, y);
	}, [cellFromEvent, strokeTo]);

	const stopPainting = useCallback(() => {
		paintingRef.current = false;
		lastCellRef.current = null;
	}, []);

	const handleContextMenu = useCallback((event) => event.preventDefault(), []);

	const handleUndo = useCallback(() => {
		const engine = engineRef.current;
		if (!engine) return;
		engine.undo();
		setStats((value) => ({ ...value, canUndo: engine.can_undo }));
	}, []);

	const runPreset = useCallback((build) => {
		const engine = engineRef.current;
		if (!engine) return;
		try {
			engine.clear(); // snapshots first, so a preset is undoable
			build(engine, idOfRef.current);
			setRunning(true);
			setStats((value) => ({ ...value, canUndo: true }));
		} catch (error) {
			console.error("Failed to build preset:", error);
		}
	}, []);

	const savePng = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		canvas.toBlob((blob) => {
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = `alkalab-${Date.now()}.png`;
			link.click();
			URL.revokeObjectURL(link.href);
		});
	}, []);

	// Keyboard shortcuts, mirroring the standalone front end.
	useEffect(() => {
		if (status !== "ready") return undefined;
		const onKeyDown = (event) => {
			const engine = engineRef.current;
			if (!engine) return;
			if (event.ctrlKey && event.key.toLowerCase() === "z") {
				engine.undo();
				event.preventDefault();
				return;
			}
			const target = event.target;
			if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) return;
			const key = event.key.toLowerCase();
			if (key === " ") setRunning((value) => !value);
			else if (key === "s") { setRunning(false); engine.step(); }
			else if (key === "c") engine.clear();
			else if (key === "x") setTool((value) => (value === "boom" ? "paint" : "boom"));
			else if (key === "e") selectElement(byNameRef.current.get("Air"));
			else if (key >= "1" && key <= "9") selectElement(byNameRef.current.get(HOTKEYS[Number(key) - 1]));
			else if (key === "0") selectElement(byNameRef.current.get(HOTKEYS[9]));
			else return;
			event.preventDefault();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [status, selectElement]);

	const notes = t("alkalab.notes");

	return (
		<HelmetProvider>
			<main className="alkalab-page portfolio-shell">
				<Tab title={t("alkalab.title")} />
				<header className="page-heading">
					<div className="page-eyebrow"><span>{projectNumber("alkalab")} / {t("alkalab.title")}</span></div>
					<h1>{t("alkalab.title")}</h1>
					<p>{t("alkalab.description")}</p>
					<RepoButton href={l.alkalab} />
				</header>

				<section className="alkalab-section" aria-labelledby="alkalab-lab-title">
					<div className="alkalab-section-head">
						<div>
							<span className="alkalab-section-label">{t("alkalab.section_label")}</span>
							<h2 id="alkalab-lab-title">{t("alkalab.lab_title")}</h2>
						</div>
						<span className="alkalab-status" role="status">{t(`alkalab.${status}`)}</span>
					</div>

					<div className="alkalab-lab">
						<div className="alkalab-hud">
							<span><b>{stats.fps.toFixed(0)}</b> {t("alkalab.hud.fps")}</span>
							<span><b>{speed}</b> {t("alkalab.hud.speed")}</span>
							<span><b>{stats.frame}</b> {t("alkalab.hud.frame")}</span>
							<span><b>{stats.particles}</b> {t("alkalab.hud.particles")}</span>
						</div>

						<div className="alkalab-layout">
							<div className="alkalab-stage">
								<div className="alkalab-canvas-frame">
									<canvas
										ref={canvasRef}
										className="alkalab-canvas"
										width={WIDTH}
										height={HEIGHT}
										tabIndex="0"
										aria-label={t("alkalab.aria_label")}
										onPointerDown={handlePointerDown}
										onPointerMove={handlePointerMove}
										onPointerUp={stopPainting}
										onPointerCancel={stopPainting}
										onContextMenu={handleContextMenu}
									/>
								</div>

								<div className="alkalab-toolbar">
									<div className="alkalab-field">
										<label htmlFor="alkalab-brush">{t("alkalab.controls.brush")}</label>
										<input id="alkalab-brush" type="range" min="0" max="24" value={brush} onChange={(event) => setBrush(Number(event.target.value))} />
										<output>{brush}</output>
									</div>
									<div className="alkalab-field">
										<label htmlFor="alkalab-shape">{t("alkalab.controls.shape")}</label>
										<select id="alkalab-shape" value={shape} onChange={(event) => setShape(event.target.value)}>
											<option value="circle">{t("alkalab.controls.circle")}</option>
											<option value="square">{t("alkalab.controls.square")}</option>
											<option value="spray">{t("alkalab.controls.spray")}</option>
										</select>
									</div>
									<div className="alkalab-buttons">
										<button type="button" className={tool === "boom" ? "active" : ""} onClick={() => setTool((value) => (value === "boom" ? "paint" : "boom"))}>{t("alkalab.controls.boom")}</button>
										<button type="button" onClick={() => setRunning((value) => !value)}>{running ? t("alkalab.controls.pause") : t("alkalab.controls.play")}</button>
										<button type="button" onClick={() => { setRunning(false); engineRef.current?.step(); }}>{t("alkalab.controls.step")}</button>
										<button type="button" onClick={() => engineRef.current?.clear()}>{t("alkalab.controls.clear")}</button>
										<button type="button" disabled={!stats.canUndo} onClick={handleUndo}>{t("alkalab.controls.undo")}</button>
										<button type="button" onClick={savePng}>{t("alkalab.controls.save")}</button>
									</div>
									<div className="alkalab-field">
										<label htmlFor="alkalab-speed">{t("alkalab.controls.speed")}</label>
										<select id="alkalab-speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
											{[1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}&times;</option>)}
										</select>
									</div>
								</div>

								<p className="alkalab-hint">{t("alkalab.hint")}</p>
							</div>

							<aside className="alkalab-sidebar">
								<section className="alkalab-panel">
									<h2>{t("alkalab.panels.experiments")}</h2>
									<div className="alkalab-presets">
										{PRESETS.map(({ key, build }) => (
											<button key={key} type="button" onClick={() => runPreset(build)}>{t(`alkalab.presets.${key}`)}</button>
										))}
									</div>
								</section>

								<section className="alkalab-panel">
									<h2>{t("alkalab.panels.elements")}</h2>
									<p className="alkalab-selected">{selected ? `${selected.name} - ${selected.formula}` : ""}</p>
									<div className="alkalab-palette">
										{catalog.filter((entry) => entry.name !== "Air").map((entry) => (
											<button
												key={entry.id}
												type="button"
												className={`alkalab-element ${selected?.id === entry.id ? "is-selected" : ""}`}
												title={`${entry.name} (${entry.formula}) - ${entry.desc}`}
												onClick={() => selectElement(entry)}
											>
												<span className="alkalab-swatch" style={{ background: entry.color }} aria-hidden="true" />
												<span className="alkalab-element-name">{entry.name}</span>
												<span className="alkalab-formula">{entry.formula}</span>
											</button>
										))}
									</div>
								</section>

								<section className="alkalab-panel">
									<h2>{t("alkalab.panels.log")}</h2>
									<ul className="alkalab-log">
										{log.length === 0
											? <li className="alkalab-log-empty">{t("alkalab.panels.empty_log")}</li>
											: log.map((entry, index) => (
												<li key={`${entry.equation}-${index}`}>{entry.equation}{entry.count > 1 ? <b> &times;{entry.count}</b> : null}</li>
											))}
									</ul>
								</section>

								<section className="alkalab-panel">
									<h2>{t("alkalab.panels.notes")}</h2>
									<ul className="alkalab-notes">
										{Array.isArray(notes) && notes.map((note, index) => <li key={index}>{note}</li>)}
									</ul>
								</section>
							</aside>
						</div>
					</div>
				</section>
			</main>
		</HelmetProvider>
	);
};

export default Alkalab;