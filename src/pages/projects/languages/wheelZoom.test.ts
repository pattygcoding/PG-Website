import { WHEEL_FALLBACK_SMOOTH_STEP, WHEEL_ZOOM_PER_NOTCH, notchDeltaFor, wheelSmoothStepFor } from "./wheelZoom";

/** The scale the library would arrive at for one wheel event, mirroring its own formula. */
const scaleAfterNotch = (scale: number, deltaMode = 0, deltaY = notchDeltaFor(deltaMode)): number =>
	scale + wheelSmoothStepFor(scale, deltaMode) * deltaY;

test("every wheel notch adds the same fraction of the current zoom", () => {
	for (const scale of [0.5, 1, 1.5, 3, 6, 11]) {
		expect(scaleAfterNotch(scale) / scale).toBeCloseTo(1 + WHEEL_ZOOM_PER_NOTCH);
	}
});

test("the same notch keeps working as the zoom grows", () => {
	// The old fixed step meant the second half of the range crawled: crossing 1x -> 12x
	// took ~110 notches, and the last few moved barely at all.
	let scale = 1;
	let notches = 0;
	while (scale < 12 && notches < 100) {
		scale = scaleAfterNotch(scale);
		notches += 1;
	}
	expect(scale).toBeGreaterThanOrEqual(12);
	expect(notches).toBeLessThanOrEqual(10);
});

test("a line-mode wheel zooms as much as a pixel-mode one", () => {
	// Firefox reports 3 lines per notch; without normalising, the step lands ~33x short.
	expect(notchDeltaFor(0)).toBe(100);
	expect(notchDeltaFor(1)).toBe(3);
	expect(notchDeltaFor(2)).toBe(1);
	expect(scaleAfterNotch(1, 1) / 1).toBeCloseTo(1 + WHEEL_ZOOM_PER_NOTCH);
});

test("a trackpad's small deltas stay proportional", () => {
	// A trackpad sends many small deltas; the step must follow the size of the event.
	expect(scaleAfterNotch(1, 0, 20)).toBeCloseTo(1 + WHEEL_ZOOM_PER_NOTCH / 5);
	expect(scaleAfterNotch(1, 0, 200)).toBeCloseTo(1 + WHEEL_ZOOM_PER_NOTCH * 2);
});

test("a collapsed scale never yields a zero step", () => {
	expect(wheelSmoothStepFor(0)).toBeGreaterThan(0);
	expect(WHEEL_FALLBACK_SMOOTH_STEP).toBeGreaterThan(0);
});
