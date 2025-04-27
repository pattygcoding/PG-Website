import React, { useEffect, useRef, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";
import { validateCube } from "./cube/validate";
import { setupCubeSolver } from "./cube/setup";

import "./CubeSolver.css";

const CubeSolver = () => {
	const { t } = useLang();
	const mountRef = useRef(null);
	const cubeGroupRef = useRef(null);
	const rendererRef = useRef(null);
	const cameraRef = useRef(null);
	const sceneRef = useRef(null);
	const controlsRef = useRef(null);

	const [selectedColor, setSelectedColor] = useState(null);
	const [rotateMode, setRotateMode] = useState(true);
	const [validationResults, setValidationResults] = useState([]);

	const selectedColorRef = useRef(null);
	const rotateModeRef = useRef(true);

	const colorOptions = [
		{ color: "white", hex: "#ffffff" },
		{ color: "yellow", hex: "#ffff00" },
		{ color: "blue", hex: "#0000ff" },
		{ color: "orange", hex: "#ffa500" },
		{ color: "green", hex: "#00ff00" },
		{ color: "red", hex: "#ff0000" },
	];

	function handleSolve() {
		const missingPieces = validateCube(cubeGroupRef);
		setValidationResults(missingPieces);
	}

	useEffect(() => {
		if (!mountRef.current) return;

		const cleanup = setupCubeSolver(mountRef, {
			sceneRef,
			cubeGroupRef,
			rendererRef,
			cameraRef,
			controlsRef,
			selectedColorRef,
			rotateModeRef,
		});

		return cleanup;
	}, []);

	return (
		<HelmetProvider>
			<Container>
				<Tab title={t("cube_solver.title")} />
				<PageTitle title={t("cube_solver.title")} />
				<div className="cube-solver-container">
					<div className="left-panel">
						<div className="cube-canvas" ref={mountRef} />
						<div className="solve-row">
							<button className="solve-button" onClick={handleSolve}>
								{t("cube_solver.solve", { defaultValue: "Solve" })}
							</button>

							<div className="validation-results">
								{validationResults.length === 0 ? (
									<span style={{ color: "green" }}>
										Cube is valid! ✅
									</span>
								) : (
									<span style={{ color: "red" }}>
										Cube is invalid. Missing pieces: {validationResults.join(", ")} ❌
									</span>
								)}
							</div>
						</div>

					</div>

					<div className="color-picker">
						<div
							className={`color-circle rotate-circle ${rotateMode ? "selected" : ""}`}
							onClick={() => {
								setRotateMode(true);
								rotateModeRef.current = true;
								setSelectedColor(null);
								selectedColorRef.current = null;
							}}
						>
							🔄
							{rotateMode && <span className="checkmark">✔</span>}
						</div>

						{colorOptions.map((option) => (
							<div
								key={option.color}
								className={`color-circle ${selectedColor === option.color ? "selected" : ""}`}
								style={{ backgroundColor: option.hex }}
								onClick={() => {
									setSelectedColor(option.color);
									selectedColorRef.current = option.color;
									setRotateMode(false);
									rotateModeRef.current = false;
								}}
							>
								{selectedColor === option.color && <span className="checkmark">✔</span>}
							</div>
						))}
					</div>
				</div>
			</Container>
		</HelmetProvider>
	);
};

export default CubeSolver;
