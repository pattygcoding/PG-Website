// Label layout maths for the /languages world map.
//
// Country names have to balance two opposing needs: the overview only stays
// legible when a handful of names are drawn, while zooming in should reveal more
// of them. A country earns a label once its projected area covers enough *screen*
// pixels, so the thresholds take both the zoom level and the rendered width of
// the map into account.
import { geoArea, geoBounds, geoCentroid, geoContains, type GeoGeometryObjects, type GeoProjection } from "d3-geo";

/** Coordinate space of the map (see the ComposableMap width/height props). */
export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 562;

/** Smallest on-screen area (CSS px²) a country must cover to earn a label. */
export const LABEL_MIN_AREA_PX = 1600;

/** Labels are drawn at this size, whatever the zoom level. */
export const LABEL_FONT_PX = 11;

/** Islands are point markers, so they only earn labels deep into a zoom. */
export const LABEL_ISLAND_MIN_SCALE = 5;

/** Zoom range of the map (see the TransformWrapper min/maxScale props). */
export const LABEL_MIN_SCALE = 0.5;
export const LABEL_MAX_SCALE = 12;

/**
 * Labels are laid out on a geometric ladder of zoom steps rather than on every
 * animation frame, so one zoom gesture re-renders the map a few dozen times at
 * most. 1.06 keeps a step's size change under ~6%, i.e. imperceptible.
 */
export const LABEL_ZOOM_STEP = 1.06;

/**
 * Snaps a zoom factor to the nearest label step. The result is deterministic —
 * equal inputs always produce an identical value — which is what lets React bail
 * out of re-rendering while the zoom sits inside a single step.
 */
export const quantizeLabelScale = (scale: number): number => {
	const bounded = Math.min(Math.max(scale, LABEL_MIN_SCALE), LABEL_MAX_SCALE);
	const step = Math.round(Math.log(bounded) / Math.log(LABEL_ZOOM_STEP));
	return Math.min(Number(Math.pow(LABEL_ZOOM_STEP, step).toFixed(4)), LABEL_MAX_SCALE);
};

/** CSS pixels covered by one map unit when the map is `mapWidthPx` wide. */
export const pixelsPerMapUnit = (mapWidthPx: number): number => Math.max(mapWidthPx, 1) / MAP_WIDTH;

/** Converts an area in map units² into the CSS pixels it covers at `screenScale`. */
export const screenAreaPx = (mapUnitArea: number, screenScale: number): number =>
	mapUnitArea * screenScale * screenScale;

/** True when a country of `mapUnitArea` is large enough on screen to hold a label. */
export const isCountryLabelVisible = (mapUnitArea: number, screenScale: number): boolean =>
	screenAreaPx(mapUnitArea, screenScale) >= LABEL_MIN_AREA_PX;

/** Font size, in map units, that renders at exactly `LABEL_FONT_PX` CSS pixels. */
export const labelFontSizeForScale = (screenScale: number): number => LABEL_FONT_PX / Math.max(screenScale, 0.0001);

/** A country's largest landmass, so islands and distant territories do not skew it. */
export const largestLandmass = (geometry: GeoGeometryObjects): GeoGeometryObjects => {
	if (geometry.type !== "MultiPolygon") return geometry;
	return geometry.coordinates.reduce<GeoGeometryObjects>((largest, coordinates) => {
		const candidate: GeoGeometryObjects = { type: "Polygon", coordinates };
		return geoArea(candidate) > geoArea(largest) ? candidate : largest;
	}, { type: "Polygon", coordinates: geometry.coordinates[0] });
};

/**
 * Where a country's name should sit, in map units.
 *
 * The anchor is the spherical centroid of the country's *largest landmass* — not of
 * the whole feature, and not of the projection:
 *
 * - a projected centroid drags countries with polar or remote territory far from
 *   their mainland, because Mercator inflates high latitudes enormously (Norway was
 *   pulled 50 units north by Svalbard, Canada 41 by the Arctic archipelago, the USA
 *   45 by Alaska);
 * - a whole-feature centroid treats every distant island as equal to the mainland,
 *   which moves France, the Netherlands and Indonesia off into the sea.
 *
 * Thin, curved countries can still have their centroid outside themselves (Vietnam's
 * lands in Laos), so those fall back to the interior point nearest that centroid.
 */
export const labelPointFor = (geometry: unknown, projection: GeoProjection): [number, number] | null => {
	if (!geometry) return null;
	const landmass = largestLandmass(geometry as GeoGeometryObjects);
	const centroid = geoCentroid(landmass);
	if (geoContains(landmass, centroid)) return projection(centroid);

	const [[west, south], [east, north]] = geoBounds(landmass);
	// A box wrapping the antimeridian (west > east) is not worth scanning.
	if (east <= west || north <= south) return projection(centroid);

	// Scan the landmass and keep the interior sample nearest the centroid. Only runs
	// for shapes that fail the test above, and only once per country.
	const target = projection(centroid);
	const steps = 24;
	let best: [number, number] = centroid;
	let bestDistance = Infinity;
	for (let x = 0; x <= steps; x += 1) {
		for (let y = 0; y <= steps; y += 1) {
			const candidate: [number, number] = [west + ((east - west) * x) / steps, south + ((north - south) * y) / steps];
			if (!geoContains(landmass, candidate)) continue;
			const point = projection(candidate);
			if (!point) continue;
			const distance = target ? Math.hypot(point[0] - target[0], point[1] - target[1]) : 0;
			if (distance < bestDistance) {
				bestDistance = distance;
				best = candidate;
			}
		}
	}
	return projection(best);
};
