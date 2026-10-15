import { geoCentroid, geoContains, geoMercator } from "d3-geo";
import {
	LABEL_FONT_PX,
	LABEL_ISLAND_MIN_SCALE,
	LABEL_MAX_SCALE,
	LABEL_MIN_SCALE,
	LABEL_ZOOM_STEP,
	MAP_HEIGHT,
	MAP_WIDTH,
	isLabelVisible,
	labelFontSizeForScale,
	labelPointFor,
	pixelsPerMapUnit,
	quantizeLabelScale,
	screenAreaPx,
} from "./mapLabels";

/** The projection the /languages map is drawn with. */
const mapProjection = () => geoMercator().translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]).scale(140);

/** Renders at the map's projection, so assertions can use geoContains directly. */
const anchorAsLonLat = (geometry: unknown) => {
	const projection = mapProjection();
	const point = labelPointFor(geometry, projection);
	expect(point).not.toBeNull();
	// A mercator projection can always be inverted; d3's types make `invert` optional.
	return projection.invert!(point!)!;
};

const ring = (coordinates: number[][]): { type: "Polygon"; coordinates: number[][][] } => ({ type: "Polygon", coordinates: [coordinates] });

test("quantizeLabelScale snaps the live zoom to a repeatable step", () => {
	expect(quantizeLabelScale(1)).toBe(1);

	// A zoom anywhere inside one step maps to that step's exact value, which is
	// what lets React bail out of re-rendering while a gesture continues.
	expect(new Set([1.4, 1.4000001, 1.4].map(quantizeLabelScale)).size).toBe(1);

	// The snapped value never trails the live zoom by a whole step...
	for (const scale of [1, 1.2, 1.5, 2, 2.7, 3, 4.5, 6, 8, 11.9]) {
		const snapped = quantizeLabelScale(scale);
		expect(snapped).toBeLessThanOrEqual(scale * LABEL_ZOOM_STEP);
		expect(snapped).toBeGreaterThan(scale / LABEL_ZOOM_STEP);
	}
	// ...and never grows past the map's own zoom range.
	expect(quantizeLabelScale(0.01)).toBe(quantizeLabelScale(LABEL_MIN_SCALE));
	expect(quantizeLabelScale(1000)).toBe(LABEL_MAX_SCALE);
	expect(quantizeLabelScale(12)).toBeLessThanOrEqual(LABEL_MAX_SCALE);

	// Stepping up the zoom can only ever reveal more names.
	expect(quantizeLabelScale(2)).toBeGreaterThan(quantizeLabelScale(1.9));
});

test("pixelsPerMapUnit converts the rendered map width into map units", () => {
	expect(pixelsPerMapUnit(1000)).toBe(1);
	expect(pixelsPerMapUnit(500)).toBe(0.5);
	expect(pixelsPerMapUnit(360)).toBeCloseTo(0.36);
	// A collapsed layout must not yield a zero or negative scale.
	expect(pixelsPerMapUnit(0)).toBeGreaterThan(0);
});

test("a country earns a label once it covers enough screen area", () => {
	expect(screenAreaPx(100, 3)).toBe(900);

	expect(isLabelVisible(1600, 1)).toBe(true);
	expect(isLabelVisible(1599, 1)).toBe(false);

	// Zooming in multiplies the on-screen area, so smaller countries qualify.
	expect(isLabelVisible(400, 2)).toBe(true);
	expect(isLabelVisible(400, 1.9)).toBe(false);

	// A phone-width map fits fewer names at the same zoom.
	const phoneScale = pixelsPerMapUnit(360);
	expect(isLabelVisible(4000, phoneScale)).toBe(false);
	expect(isLabelVisible(20000, phoneScale)).toBe(true);
});

test("label glyphs keep a constant on-screen size", () => {
	for (const scale of [0.5, 1, 1.5, 2.5, 5, 8, 12]) {
		expect(labelFontSizeForScale(scale) * scale).toBeCloseTo(LABEL_FONT_PX);
	}
	// Never divides by zero on a collapsed layout.
	expect(labelFontSizeForScale(0)).toBeGreaterThan(0);
});

test("island labels stay hidden until the map is zoomed well in", () => {
	expect(LABEL_ISLAND_MIN_SCALE).toBeGreaterThan(1);
	expect(LABEL_ISLAND_MIN_SCALE).toBeLessThanOrEqual(LABEL_MAX_SCALE);
});

// The map's own projection is used below so that geoContains can be asked whether an
// anchor really sits on the country it names. GeoJSON rings are wound so that the
// land itself is the small region — d3 reads the interior from the ring direction, and
// the guards below keep the fixtures honest.
test("a label anchors to the largest landmass, not to outlying territory", () => {
	// A mainland with a much smaller territory far to the north, as Norway has in
	// Svalbard; a projected centroid of the whole feature lands in the Arctic.
	const mainland = ring([[5, 58], [5, 71], [12, 71], [12, 58], [5, 58]]);
	const territory = ring([[15, 78], [15, 80], [18, 80], [18, 78], [15, 78]]);
	const country = { type: "MultiPolygon", coordinates: [mainland.coordinates, territory.coordinates] };
	expect(geoContains(mainland, [8, 64])).toBe(true);
	expect(geoContains(territory, [16.5, 79])).toBe(true);

	const anchor = anchorAsLonLat(country);
	expect(geoContains(mainland, anchor)).toBe(true);
	expect(geoContains(territory, anchor)).toBe(false);
});

test("a label stays on a country whose own centroid falls outside it", () => {
	// A C-shaped landmass, like the curve of Vietnam: the centroid of its bounding
	// area sits in the gap, which is not part of the country (it would read as
	// "Vietnam" printed over Laos).
	const crescent = ring([[0, 0], [0, 10], [10, 10], [10, 8], [2, 8], [2, 2], [10, 2], [10, 0], [0, 0]]);
	expect(geoContains(crescent, [5, 5])).toBe(false);
	expect(geoContains(crescent, geoCentroid(crescent))).toBe(false);

	const anchor = anchorAsLonLat(crescent);
	expect(geoContains(crescent, anchor)).toBe(true);
});

test("an empty geometry has no anchor at all", () => {
	expect(labelPointFor(null, mapProjection())).toBeNull();
	expect(labelPointFor(undefined, mapProjection())).toBeNull();
});
