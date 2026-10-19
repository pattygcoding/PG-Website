import { projects } from "./projects";

/**
 * The Rijndael implementations have their own showcase, so every sample opens
 * that site's address for its language: a bare `/<language>`, which the showcase
 * answers with the implementation at its first key size (see the
 * Rijandel-Encryption `docs/links.md` link index).
 */
const SHOWCASE = "https://encryption.pattygcoding.com/";
const rijandel = projects.filter(({ group }) => group === "rijandel_encryption");

test("rijandel encryption samples open the showcase instead of GitHub", () => {
	expect(rijandel.map(({ link }) => link)).toEqual([
		`${SHOWCASE}c`,
		`${SHOWCASE}cpp`,
		`${SHOWCASE}csharp`,
		`${SHOWCASE}haskell`,
		`${SHOWCASE}java`,
		`${SHOWCASE}javascript`,
		`${SHOWCASE}kotlin`,
		`${SHOWCASE}php`,
		`${SHOWCASE}python`,
		`${SHOWCASE}ruby`,
		`${SHOWCASE}typescript`,
	]);
	expect(projects.filter(({ link }) => link.includes("Rijandel-Encryption"))).toEqual([]);
});

test("rijandel encryption samples keep the display names their skills give them", () => {
	expect(rijandel.map(({ label }) => label)).toEqual([
		"Rijandel Encryption (C)",
		"Rijandel Encryption (C++)",
		"Rijandel Encryption (C#)",
		"Rijandel Encryption (Haskell)",
		"Rijandel Encryption (Java)",
		"Rijandel Encryption (JavaScript)",
		"Rijandel Encryption (Kotlin)",
		"Rijandel Encryption (PHP)",
		"Rijandel Encryption (Python)",
		"Rijandel Encryption (Ruby)",
		"Rijandel Encryption (TypeScript)",
	]);
});

interface LocaleMessages {
	portfolio: { entries: { rijandel_encryption: { link: string } } };
}

// The project cards read their links from the locale files, so every one of them
// has to point at the showcase too.
const locales = import.meta.glob<LocaleMessages>("../lang/*.json", { eager: true, import: "default" });

test("every locale sends the rijandel encryption card to the showcase", () => {
	expect(Object.keys(locales).length).toBeGreaterThan(90);
	for (const [file, messages] of Object.entries(locales)) {
		expect(`${file}: ${messages.portfolio.entries.rijandel_encryption.link}`).toBe(`${file}: ${SHOWCASE}`);
	}
});
