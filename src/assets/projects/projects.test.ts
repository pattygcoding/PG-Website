import { projects } from "./projects";

/**
 * The Rijndael implementations have their own showcase, so every sample opens
 * that site's address for its language: a bare `/<language>`, which the showcase
 * answers with the implementation at its first key size (see the
 * Rijndael-Encryption `docs/links.md` link index).
 */
const SHOWCASE = "https://encryption.pattygcoding.com/";
const rijndael = projects.filter(({ group }) => group === "rijndael_encryption");

test("rijndael encryption samples open the showcase instead of GitHub", () => {
	expect(rijndael.map(({ link }) => link)).toEqual([
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
	expect(projects.filter(({ link }) => link.includes("Rijndael-Encryption"))).toEqual([]);
});

test("rijndael encryption samples keep the display names their skills give them", () => {
	expect(rijndael.map(({ label }) => label)).toEqual([
		"Rijndael Encryption (C)",
		"Rijndael Encryption (C++)",
		"Rijndael Encryption (C#)",
		"Rijndael Encryption (Haskell)",
		"Rijndael Encryption (Java)",
		"Rijndael Encryption (JavaScript)",
		"Rijndael Encryption (Kotlin)",
		"Rijndael Encryption (PHP)",
		"Rijndael Encryption (Python)",
		"Rijndael Encryption (Ruby)",
		"Rijndael Encryption (TypeScript)",
	]);
});

interface LocaleMessages {
	portfolio: { entries: { rijndael_encryption: { link: string } } };
}

// The project cards read their links from the locale files, so every one of them
// has to point at the showcase too.
const locales = import.meta.glob<LocaleMessages>("../lang/*.json", { eager: true, import: "default" });

test("every locale sends the rijndael encryption card to the showcase", () => {
	expect(Object.keys(locales).length).toBeGreaterThan(90);
	for (const [file, messages] of Object.entries(locales)) {
		expect(`${file}: ${messages.portfolio.entries.rijndael_encryption.link}`).toBe(`${file}: ${SHOWCASE}`);
	}
});
