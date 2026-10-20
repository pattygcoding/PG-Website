import { showcaseProjectIds } from "@/assets/projects/rankings";
import english from "@/assets/lang/en_us.json";
import links from "@/assets/links/links.json";

/** One card in the home page's Selected Work. */
export interface ShowcaseProject {
	key: string;
	/** The artwork filename, from links.json. */
	image: string;
	/** Set when the card opens a page of this site instead of the project's own URL. */
	to?: string;
	/** Badge keys, looked up in `home.featured.badges`. */
	badges: string[];
	/** Set when the card borrows another page's copy instead of the project's. */
	dataKey?: "languages";
	/** The lead card, which the stylesheet sizes up. */
	featured: boolean;
}

interface PortfolioEntry {
	link: string;
}

// The extras the cards carry, keyed by portfolio id: the two that open on a page of
// their own, the one that borrows the translator's copy, and the badges that are not
// the default "Available Here".
const extras: Record<string, Partial<ShowcaseProject>> = {
	takeoff_engine: { badges: ["saas", "full_website"] },
	tiger_programming_language: { to: "/tiger" },
	suprememc: { badges: ["minecraft_mod"] },
	portfolio_website: { badges: ["full_website"] },
	biblioteca: { to: "/languages", dataKey: "languages" },
};

const entries = english.portfolio.entries as Record<string, PortfolioEntry>;
const images = links.portfolio as Record<string, string>;

/**
 * The home page's Selected Work: the top of the project ranking, in ranked order, so
 * raising a project's weight in rankings.json is all it takes to feature it. A card
 * opens in-app when it has a route of its own, or when the project's own link is a
 * page of this site.
 */
export const showcaseProjects: ShowcaseProject[] = showcaseProjectIds.map((key, index) => {
	const extra = extras[key] ?? {};
	const link = entries[key]?.link ?? "";
	return {
		key,
		image: images[key] || images.default,
		to: extra.to ?? (link.startsWith("/") ? link : undefined),
		badges: extra.badges ?? ["available_here"],
		dataKey: extra.dataKey,
		featured: index === 0,
	};
});