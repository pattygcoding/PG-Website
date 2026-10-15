import { readFileSync } from "node:fs";
import path from "node:path";

// The borders the map draws dotted are checked in — see Languages.tsx, which draws them
// over the subdivision outlines. They must not contain a border the country layer already
// draws solid: the outlines come from data that puts the US states and the Canadian
// provinces on the same line, so the US-Canada border counts as an interior border
// there, and dotting it dotted the international boundary (and the coasts).
const BORDERS = JSON.parse(
	readFileSync(path.join(process.cwd(), "public/assets/maps/subdivision-borders-50m.json"), "utf8")
) as { type: string; features: { geometry: { type: string; coordinates: [number, number][] } }[] };

/**
 * How much border runs *along* a line, in degrees: the sum of the segments whose two ends
 * both sit within 0.02 degrees of it. A country boundary shows up as tens of degrees,
 * where an interior border merely *meeting* one — a state's edge running into the 49th
 * parallel, say — contributes a single vertex rather than a segment.
 */
const degreesAlong = (onLine: (point: [number, number]) => boolean) =>
	BORDERS.features.reduce((total, { geometry }) => {
		let running = 0;
		for (let index = 1; index < geometry.coordinates.length; index += 1) {
			const from = geometry.coordinates[index - 1];
			const to = geometry.coordinates[index];
			if (onLine(from) && onLine(to)) running += Math.hypot(to[0] - from[0], to[1] - from[1]);
		}
		return total + running;
	}, 0);

test("the dotted borders stop at the US-Canada border rather than running along it", () => {
	// The 49th parallel, which the border follows from the Pacific to the Lake of the Woods.
	const on49thParallel = ([lon, lat]: [number, number]) => Math.abs(lat - 49) < 0.02 && lon > -124 && lon < -95;
	expect(degreesAlong(on49thParallel)).toBeLessThan(0.1);
});

test("the dotted borders stop at the Alaska border too", () => {
	// The 141st meridian, which the border follows from the Arctic down to the coast.
	const on141stMeridian = ([lon, lat]: [number, number]) => Math.abs(lon + 141) < 0.02 && lat > 60 && lat < 69;
	expect(degreesAlong(on141stMeridian)).toBeLessThan(0.1);
});

test("the borders inside a country are still there to dot", () => {
	// Kansas and Nebraska share the 40th parallel for most of their width.
	const kansasNebraska = ([lon, lat]: [number, number]) => Math.abs(lat - 40) < 0.02 && lon > -103 && lon < -95;
	expect(degreesAlong(kansasNebraska)).toBeGreaterThan(3);

	// England and Scotland share the Tweed and the Cheviots, which the country layer
	// cannot draw: it sees the UK as one country.
	const englandScotland = ([lon, lat]: [number, number]) => lat > 54.9 && lat < 55.9 && lon > -3.6 && lon < -1.9;
	expect(degreesAlong(englandScotland)).toBeGreaterThan(0.5);
});

test("every dotted border is an open line rather than a shape", () => {
	// Shapes would be filled as well as stroked, and each would be stroked all the way
	// round — which is the bug these lines exist to avoid.
	expect(BORDERS.type).toBe("FeatureCollection");
	expect(BORDERS.features.length).toBeGreaterThan(50);
	for (const { geometry } of BORDERS.features) {
		expect(geometry.type).toBe("LineString");
		expect(geometry.coordinates.length).toBeGreaterThan(1);
	}
});
