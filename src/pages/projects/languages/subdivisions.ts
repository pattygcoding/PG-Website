// Language support for the three countries the map splits up, keyed by the ISO
// 3166-2 codes carried by public/assets/maps/subdivisions-50m.json (US states, plus
// DC; Canadian provinces and territories; UK constituent countries).
//
// Every subdivision speaks its country's language, apart from Quebec (French) and
// the handful that also speak a regional language the portfolio is translated into.

/** Countries the map splits up; their own label is dropped while they are split. */
const COUNTRY_LANGUAGES: Record<string, string[]> = {
	US: ["en_us"],
	CA: ["en_us"],
	GB: ["en_us"],
};

/** Subdivisions that speak an additional regional language. */
const REGIONAL_LANGUAGES: Record<string, string[]> = {
	"US-HI": ["haw_us"], // Hawaii: English and Hawaiian
	"GB-WLS": ["cy_gb"], // Wales: English and Welsh
	"GB-SCT": ["gd_gb"], // Scotland: English and Scottish Gaelic
};

/** Subdivisions whose language is not their country's default one. */
const REPLACED_LANGUAGES: Record<string, string[]> = {
	"CA-QC": ["fr_fr"], // Quebec: French rather than English
};

export const SUBDIVIDED_COUNTRIES: readonly string[] = Object.keys(COUNTRY_LANGUAGES);

/**
 * Zoom step at which the map swaps a split country for its parts. Everything that
 * needs to know whether subdivisions are on the map agrees on this one rule.
 */
export const SUBDIVISION_MIN_SCALE = 3;

export const subdivisionsVisibleAt = (zoomStep: number): boolean => zoomStep >= SUBDIVISION_MIN_SCALE;

/** True for the countries that are drawn as subdivisions when zoomed in. */
export const isSubdividedCountry = (iso2: string | null | undefined): boolean =>
	iso2 !== null && iso2 !== undefined && SUBDIVIDED_COUNTRIES.includes(iso2);

/** ISO 3166-2 prefix, e.g. "US-HI" -> "US"; also the flag a subdivision shows. */
export const subdivisionCountry = (id: string): string => id.slice(0, 2);

/**
 * Subdivisions the flag set actually has flags for.
 *
 * The library renders `<img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/{code}.svg">`
 * without validating the code, so anything that exists in flag-icons works. It ships the
 * four UK countries — the only subdivisions it carries: there is no `us-*` or `ca-*` in
 * the set, and no published set of state/province flags to fall back on, so those keep
 * their country's flag.
 */
const SUBDIVISION_FLAGS: Record<string, string> = {
	"GB-ENG": "gb-eng",
	"GB-SCT": "gb-sct",
	"GB-WLS": "gb-wls",
	"GB-NIR": "gb-nir",
};

/** The flag a subdivision shows: its own where the flag set has one, else its country's. */
export const subdivisionFlag = (id: string): string => SUBDIVISION_FLAGS[id] ?? subdivisionCountry(id).toLowerCase();

/** The languages spoken in a subdivision, in the order they should be listed. */
export const subdivisionLanguages = (id: string): string[] => {
	const replaced = REPLACED_LANGUAGES[id];
	if (replaced) return replaced;
	return [...(COUNTRY_LANGUAGES[subdivisionCountry(id)] ?? []), ...(REGIONAL_LANGUAGES[id] ?? [])];
};
