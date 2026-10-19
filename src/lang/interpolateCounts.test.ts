import { interpolateCounts } from "./interpolateCounts";
import { projects, projectCounts } from "../assets/projects/projects";
import english from "../assets/lang/en_us.json";

const tokensIn = (text: string): string[] =>
	[...text.matchAll(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g)].map((match) => match[1]);

test("fills tokens with counts, formatted for the locale", () => {
	expect(interpolateCounts("A family of {implementations} implementations", { implementations: 136 }, "en-US"))
		.toBe("A family of 136 implementations");
	expect(interpolateCounts("{languages} languages and {patterns} patterns", { languages: 16, patterns: 18 }, "en-US"))
		.toBe("16 languages and 18 patterns");
	expect(interpolateCounts("{frameworks}", { frameworks: 1234 }, "de-DE")).toBe("1.234");
});

test("counts use the reader's own numerals, not Latin ones", () => {
	expect(interpolateCounts("{implementations}", { implementations: 136 }, "fa-IR")).toBe("۱۳۶");
	expect(interpolateCounts("{languages}", { languages: 21 }, "ne-NP")).toBe("२१");
});

test("leaves tokens without a count, and text without tokens, untouched", () => {
	expect(interpolateCounts("Used at {items}.", { implementations: 1 }, "en-US")).toBe("Used at {items}.");
	expect(interpolateCounts("No placeholders here", { implementations: 1 }, "en-US")).toBe("No placeholders here");
	expect(interpolateCounts("Some text", undefined, "en-US")).toBe("Some text");
	expect(interpolateCounts(undefined, { implementations: 1 }, "en-US")).toBe("");
});

test("counts are derived from projects.json, not written into the copy", () => {
	const samplesIn = (group: string) => projects.filter((project) => project.group === group).length;
	expect(projectCounts.connect_four.implementations).toBe(samplesIn("connect_four"));
	expect(projectCounts.rijndael_encryption.implementations).toBe(samplesIn("rijndael_encryption"));
	expect(projectCounts.turing_machine.implementations).toBe(samplesIn("turing_machine"));
	// Interop calls its sample count "patterns", so it carries no `implementations`.
	expect(projectCounts.interop.patterns).toBe(samplesIn("interop"));
	expect(projectCounts.interop.implementations).toBeUndefined();
});

test("every token the English copy uses has a count behind it", () => {
	const entries = english.portfolio.entries as Record<string, { text: string }>;
	for (const [id, counts] of Object.entries(projectCounts)) {
		const tokens = tokensIn(entries[id].text);
		expect(tokens.length).toBeGreaterThan(0);
		for (const token of tokens) expect(Object.keys(counts)).toContain(token);
	}
	// The atlas inspector shows its own interop copy, quoting the same counts.
	for (const token of tokensIn(english.home.atlas.stories.interop.summary)) {
		expect(Object.keys(projectCounts.interop)).toContain(token);
	}
});
