import { readFileSync } from "node:fs";
import path from "node:path";
import {
	SUBDIVIDED_COUNTRIES,
	SUBDIVISION_MIN_SCALE,
	isSubdividedCountry,
	subdivisionCountry,
	subdivisionFlag,
	subdivisionLanguages,
	subdivisionsVisibleAt,
} from "./subdivisions";

// The subdivision outlines are checked in, so the rules above and the map data have to
// agree: a subdivision whose code the rules do not know would render grey and nameless.
const SUBDIVISIONS = JSON.parse(
	readFileSync(path.join(process.cwd(), "public/assets/maps/subdivisions-50m.json"), "utf8")
) as { objects: { subdivisions: { geometries: { properties: { id: string } }[] } } };

const ASSET_IDS = SUBDIVISIONS.objects.subdivisions.geometries.map((geometry) => geometry.properties.id);

test("a subdivision speaks its country's language unless it says otherwise", () => {
	// Every state and province is English by default...
	expect(subdivisionLanguages("US-TX")).toEqual(["en_us"]);
	expect(subdivisionLanguages("US-DC")).toEqual(["en_us"]);
	expect(subdivisionLanguages("CA-ON")).toEqual(["en_us"]);
	expect(subdivisionLanguages("GB-ENG")).toEqual(["en_us"]);
});

test("the regional languages the portfolio supports reach their own subdivision", () => {
	// ...Hawaii adds Hawaiian, Wales adds Welsh, Scotland adds Scottish Gaelic...
	expect(subdivisionLanguages("US-HI")).toEqual(["en_us", "haw_us"]);
	expect(subdivisionLanguages("GB-WLS")).toEqual(["en_us", "cy_gb"]);
	expect(subdivisionLanguages("GB-SCT")).toEqual(["en_us", "gd_gb"]);
	// ...and Northern Ireland, whose languages the portfolio does not carry, stays English.
	expect(subdivisionLanguages("GB-NIR")).toEqual(["en_us"]);
});

test("Quebec speaks French rather than English", () => {
	expect(subdivisionLanguages("CA-QC")).toEqual(["fr_fr"]);
});

test("unknown codes never invent languages", () => {
	expect(subdivisionLanguages("ZZ-XX")).toEqual([]);
});

test("a subdivision reports the country whose flag it shows", () => {
	expect(subdivisionCountry("US-HI")).toBe("US");
	expect(subdivisionCountry("CA-QC")).toBe("CA");
	expect(subdivisionCountry("GB-WLS")).toBe("GB");
});

test("subdivisions show their own flag where the flag set has one", () => {
	// flag-icons ships the four UK countries and nothing else at this level.
	expect(subdivisionFlag("GB-ENG")).toBe("gb-eng");
	expect(subdivisionFlag("GB-SCT")).toBe("gb-sct");
	expect(subdivisionFlag("GB-WLS")).toBe("gb-wls");
	expect(subdivisionFlag("GB-NIR")).toBe("gb-nir");
});

test("the rest fall back to their country's flag", () => {
	// No `us-*` or `ca-*` exists in the flag set, so states and provinces keep the
	// national flag rather than showing nothing.
	expect(subdivisionFlag("US-HI")).toBe("us");
	expect(subdivisionFlag("US-DC")).toBe("us");
	expect(subdivisionFlag("CA-QC")).toBe("ca");
	expect(subdivisionFlag("ZZ-XX")).toBe("zz");
});

test("only the three split countries are treated as subdivided", () => {
	expect(SUBDIVIDED_COUNTRIES).toEqual(["US", "CA", "GB"]);
	expect(isSubdividedCountry("US")).toBe(true);
	expect(isSubdividedCountry("GB")).toBe(true);
	expect(isSubdividedCountry("FR")).toBe(false);
	expect(isSubdividedCountry(null)).toBe(false);
	expect(isSubdividedCountry(undefined)).toBe(false);
});

test("subdivisions take over above one agreed zoom step", () => {
	expect(subdivisionsVisibleAt(SUBDIVISION_MIN_SCALE)).toBe(true);
	expect(subdivisionsVisibleAt(SUBDIVISION_MIN_SCALE - 0.01)).toBe(false);
	expect(subdivisionsVisibleAt(1)).toBe(false);
});

test("every subdivision the map draws is one the language rules know", () => {
	expect(ASSET_IDS.filter((id) => id.startsWith("US-"))).toHaveLength(51); // 50 states + DC
	expect(ASSET_IDS.filter((id) => id.startsWith("CA-"))).toHaveLength(13);
	expect(ASSET_IDS.filter((id) => id.startsWith("GB-"))).toHaveLength(4);
	expect(new Set(ASSET_IDS).size).toBe(ASSET_IDS.length);

	// A code the rules do not recognise would leave a subdivision grey and nameless.
	for (const id of ASSET_IDS) {
		expect(subdivisionLanguages(id).length, `${id} would have no languages`).toBeGreaterThan(0);
	}
});

test("the regions with a regional language are present in the map data", () => {
	for (const id of ["US-HI", "CA-QC", "GB-WLS", "GB-SCT", "GB-NIR", "GB-ENG"]) {
		expect(ASSET_IDS, `${id} is missing from the map data`).toContain(id);
	}
});
