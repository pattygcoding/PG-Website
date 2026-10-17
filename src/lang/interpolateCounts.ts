import { useCallback } from "react";
import { getLanguageTag, useLang } from "./languageContext";
import { projectCounts } from "@/assets/projects/projects";

/** `{name}` where name is a count key; anything else in braces is left alone. */
const TOKEN = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

/**
 * Fills `{token}` placeholders with their count, formatted for the active locale so
 * Persian, Devanagari and Myanmar readers see their own digits rather than Latin ones.
 *
 * A token with no matching count is left as written, which keeps unrelated
 * placeholders such as `about.technical_skills.{items}` safe if they ever meet this
 * function. `lang.py` masks `{token}` before translating and restores it afterwards,
 * so the same token survives a re-translation of all 100 locale files.
 */
export const interpolateCounts = (
	text: string | undefined,
	counts: Record<string, number> = {},
	localeTag: string,
): string => {
	if (!text) return text ?? "";
	const format = new Intl.NumberFormat(localeTag);
	return text.replace(TOKEN, (token, name: string) => (name in counts ? format.format(counts[name]) : token));
};

/**
 * `interpolateCounts` bound to the active locale and a project id, for the call sites
 * that render `portfolio.entries.<id>.text` or the matching atlas story summary.
 */
export const useProjectCounts = () => {
	const { lang } = useLang();
	const localeTag = getLanguageTag(lang);
	return useCallback(
		(text: string | undefined, projectId: string): string =>
			interpolateCounts(text, projectCounts[projectId], localeTag),
		[localeTag],
	);
};
