import rankings from "./rankings.json";
import english from "../lang/en_us.json";

/**
 * How valuable each portfolio project is to me, keyed by portfolio id. One number
 * per project in `rankings.json`, edited by hand: bigger means more important, and
 * the seven biggest are what the home page leads with. Ties break on the English
 * title, so the order is stable and the same in every language.
 *
 * The portfolio page reads the same ranking for its "Selected Work" order, so there
 * is exactly one place to say what matters.
 */
export const projectWeights: Record<string, number> = rankings;

/** The home page's "Selected Work" is the top of the ranking. */
export const SHOWCASE_SIZE = 7;

interface PortfolioEntry {
	title: string;
}

const entries = english.portfolio.entries as Record<string, PortfolioEntry>;
const projectIds = Object.keys(entries);
const englishTitles: Record<string, string> = Object.fromEntries(
	projectIds.map((id) => [id, entries[id].title]),
);

/**
 * Ranks ids by weight, biggest first, breaking ties alphabetically. Exported so the
 * rule can be tested against weights other than the shipped ones.
 */
export const orderByWeight = (
	ids: readonly string[],
	weights: Record<string, number | undefined>,
	titles: Record<string, string | undefined> = englishTitles,
): string[] => [...ids].sort((first, second) =>
	(weights[second] ?? 0) - (weights[first] ?? 0) || (titles[first] ?? first).localeCompare(titles[second] ?? second),
);

/** Every portfolio project, most valuable first. */
export const rankedProjectIds: string[] = orderByWeight(projectIds, projectWeights);

/** The projects the home page features. */
export const showcaseProjectIds: string[] = rankedProjectIds.slice(0, SHOWCASE_SIZE);