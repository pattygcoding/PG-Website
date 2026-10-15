// Wheel-zoom tuning for the /languages map.
//
// react-zoom-pan-pinch adds `smoothStep * |deltaY|` to the current scale for every wheel
// event, i.e. a *fixed* amount: the same 0.1 whether you are at 1x or at 10x. That means
// each notch covers less and less of what you are looking at, and crossing the whole
// 1x-12x range took over a hundred notches of scrolling.
//
// Rewriting the step to a constant *fraction* of the current zoom makes every notch the
// same relative move, at any zoom, and normalising it by the units the device reports
// deltas in keeps line-mode wheels and trackpads in proportion too.

/** How much of the current zoom one wheel notch adds. */
export const WHEEL_ZOOM_PER_NOTCH = 0.3;

/** The deltaY, in pixels, that one notch of a pixel-mode wheel reports. */
const NOTCH_DELTA_PIXELS = 100;

/** The deltaY, in lines, that one notch of a line-mode wheel reports. */
const NOTCH_DELTA_LINES = 3;

/**
 * The deltaY one wheel notch covers, in the event's own units: `WheelEvent.deltaMode` is
 * 0 for pixels, 1 for lines and 2 for pages.
 */
export const notchDeltaFor = (deltaMode: number): number => {
	if (deltaMode === 1) return NOTCH_DELTA_LINES;
	if (deltaMode === 2) return 1;
	return NOTCH_DELTA_PIXELS;
};

/**
 * The `smoothStep` that makes one wheel notch add `WHEEL_ZOOM_PER_NOTCH` of the current
 * zoom. The library multiplies this by the event's own `deltaY`, so dividing by the
 * notch size in the same units cancels that out.
 */
export const wheelSmoothStepFor = (scale: number, deltaMode = 0): number =>
	(WHEEL_ZOOM_PER_NOTCH * Math.max(scale, 0.1)) / notchDeltaFor(deltaMode);

/**
 * What the library falls back to if the listener below never ran: the relative step for a
 * middling zoom, which is still a handful of notches across the whole range.
 */
export const WHEEL_FALLBACK_SMOOTH_STEP = wheelSmoothStepFor(4);
