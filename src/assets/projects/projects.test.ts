import { projects } from "./projects";

/**
 * The Rijndael implementations have their own showcase, so every sample opens
 * that site's address for its language: a bare `/<language>`, which the showcase
 * answers with the implementation at its first key size (see the
 * Rijndael-Encryption `docs/links.md` link index).
 */
const SHOWCASE = "https://encryption.pattygcoding.com/";
const rijndael = projects.filter(({ group }) => group === "rijndael_encryption");

/**
 * Interop has one too, where a pairing's address is `<host>-<guest>[-32bit]`,
 * so the group carries one sample per pairing the showcase publishes (see the
 * Interop-Samples `docs/links.md` link index).
 */
const INTEROP = "https://interop.pattygcoding.com/";
const interop = projects.filter(({ group }) => group === "interop");


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

test("interop samples open a showcase pairing address instead of GitHub", () => {
	// The showcase publishes 88 pairings across 37 hosts; the group mirrors them all.
	expect(interop.length).toBeGreaterThanOrEqual(88);
	for (const { link, label, skills } of interop) {
		expect(link).toMatch(/^https:\/\/interop\.pattygcoding\.com\/[a-z0-9]+(-[a-z0-9]+)*$/);
		expect(label).toMatch(/^Interop with .+ & .+( x64|x86)?$/);
		// The host, the guest, and the shared git/github/vscode tags.
		expect(skills.length).toBeGreaterThanOrEqual(5);
	}
});

test("interop keeps the two assembly variants apart by bit width", () => {
	const assembly = interop.filter(({ link }) => link.includes("-assembly-")).map(({ link, label }) => `${link.replace(INTEROP, "")} ${label}`);
	expect(assembly).toEqual([
		"c-assembly-32bit Interop with C & Assembly x86",
		"c-assembly-64bit Interop with C & Assembly x64",
		"cpp-assembly-32bit Interop with C++ & Assembly x86",
		"cpp-assembly-64bit Interop with C++ & Assembly x64",
		"haskell-assembly-32bit Interop with Haskell & Assembly x86",
		"haskell-assembly-64bit Interop with Haskell & Assembly x64",
	]);
});

interface LocaleMessages {
	portfolio: { entries: { interop: { link: string }; rijndael_encryption: { link: string } } };
}

// The project cards read their links from the locale files, so every one of them
// has to point at the showcase too.
const locales = import.meta.glob<LocaleMessages>("../lang/*.json", { eager: true, import: "default" });

test("every locale sends the showcase cards to their own site", () => {
	expect(Object.keys(locales).length).toBeGreaterThan(90);
	for (const [file, messages] of Object.entries(locales)) {
		expect(`${file}: ${messages.portfolio.entries.rijndael_encryption.link}`).toBe(`${file}: ${SHOWCASE}`);
		expect(`${file}: ${messages.portfolio.entries.interop.link}`).toBe(`${file}: ${INTEROP}`);

	}
});
