import React, { useRef, useState, useCallback } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Container } from "react-bootstrap";
import { PageTitle } from "@/components/page-title";
import { Tab } from "@/components/tab";
import { useLang } from "@/lang/languageContext";

// Import reorganized utilities
import { validateCubeCompleteness, getCubeValidationStatus } from "./utils/cubeValidation";
import { useCubeSolverWithPainting } from "./hooks/useCubeSolverPainting";
import { executeSolvingAlgorithm } from "./core/algorithmExecution";
import { applyTestCubeState } from "./utils/testStateManager";

// Import components
import { ColorPicker } from "./components/ColorPicker";
import { ValidationDisplay } from "./components/ValidationDisplay";
import { SolveButton } from "./components/SolveButton";

// Import styles
import "./CubeSolver.css";

const CubeSolver = () => {
	const { t } = useLang();
	
	// Scene references
	const mountRef = useRef(null);
	const sceneRef = useRef(null);
	const cubeGroupRef = useRef(null);
	const rendererRef = useRef(null);
	const cameraRef = useRef(null);
	const controlsRef = useRef(null);
	const mouseRef = useRef(null);
	const raycasterRef = useRef(null);
	const selectedColorRef = useRef("white");

	// Component state
	const [selectedColor, setSelectedColor] = useState("white");
	const [validationStatus, setValidationStatus] = useState(null);

	// Grouped scene references for cleaner passing
	const sceneRefs = {
		sceneRef,
		cubeGroupRef,
		rendererRef,
		cameraRef,
		controlsRef,
		selectedColorRef,
		mouseRef,
		raycasterRef,
	};

	/**
	 * Handles the start/solve button click
	 */
	const handleSolveStart = useCallback(() => {
		// Apply test state to cube
		applyTestCubeState(cubeGroupRef);

		// Validate cube completeness
		const missingPieces = validateCubeCompleteness(cubeGroupRef);
		const status = getCubeValidationStatus(missingPieces);
		setValidationStatus(status);

		// Start algorithm if cube is valid
		if (status.isValid) {
			executeSolvingAlgorithm(cubeGroupRef);
		}
	}, []);

	/**
	 * Handles color selection for painting
	 */
	const handleColorSelection = useCallback((color) => {
		setSelectedColor(color);
		selectedColorRef.current = color;
	}, []);

	// Initialize cube solver with painting functionality
	useCubeSolverWithPainting(mountRef, sceneRefs);

	return (
		<HelmetProvider>
			<Container>
				<Tab title={t("cube_solver.title")} />
				<PageTitle title={t("cube_solver.title")} />
				
				<div className="cube-solver-container">
					<div className="left-panel">
						<div className="cube-canvas" ref={mountRef} />
						
						<div className="solve-row">
							<SolveButton 
								onSolve={handleSolveStart}
								text={t("cube_solver.start", { defaultValue: "Start" })}
							/>
							
							<ValidationDisplay validationStatus={validationStatus} />
						</div>
					</div>

					<ColorPicker 
						selectedColor={selectedColor}
						onColorSelect={handleColorSelection}
					/>
				</div>
			</Container>
		</HelmetProvider>
	);
};

export default CubeSolver;
