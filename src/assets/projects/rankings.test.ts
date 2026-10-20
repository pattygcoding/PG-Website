import { SHOWCASE_SIZE, orderByWeight, projectWeights, rankedProjectIds, showcaseProjectIds } from "./rankings";
import english from "../lang/en_us.json";

interface PortfolioEntry {
	title: string;
}

const entries = english.portfolio.entries as Record<string, PortfolioEntry>;
const projectIds = Object.keys(entries);

test("every portfolio project carries a weight of its own, and nothing else does", () => {
	expect(Object.keys(projectWeights).sort()).toEqual([...projectIds].sort());
	projectIds.forEach((id) => {
		expect(typeof projectWeights[id]).toBe("number");
		expect(Number.isFinite(projectWeights[id])).toBe(true);
	});
});

test("the ranking runs biggest first, with ties broken alphabetically", () => {
	expect(rankedProjectIds.length).toBe(projectIds.length);
	expect(new Set(rankedProjectIds).size).toBe(projectIds.length);

	rankedProjectIds.forEach((id, index) => {
		if (index === 0) return;
		// A weight never goes up as the list goes down.
		expect(projectWeights[rankedProjectIds[index - 1]]).toBeGreaterThanOrEqual(projectWeights[id]);
	});

	// Every run of equal weights is in title order.
	const runs = new Map<number, string[]>();
	rankedProjectIds.forEach((id) => {
		const run = runs.get(projectWeights[id]) ?? [];
		run.push(entries[id].title);
		runs.set(projectWeights[id], run);
	});
	runs.forEach((titles) => expect(titles).toEqual([...titles].sort((first, second) => first.localeCompare(second))));
});

test("weights decide the order and equal weights fall to the title", () => {
	expect(orderByWeight(["a", "b", "c"], { a: 3, b: 3, c: 1 }, { a: "Zed", b: "Ann", c: "Most" })).toEqual(["b", "a", "c"]);
	expect(orderByWeight(["a", "b"], { a: 1, b: 9 }, { a: "Alpha", b: "Beta" })).toEqual(["b", "a"]);
	// A project with no weight of its own sorts last rather than first.
	expect(orderByWeight(["known", "unknown"], { known: 1 }, { known: "Known" })).toEqual(["known", "unknown"]);
	expect(orderByWeight([], {})).toEqual([]);
});

test("the home page features the seven biggest", () => {
	expect(showcaseProjectIds).toEqual(rankedProjectIds.slice(0, SHOWCASE_SIZE));
	expect(showcaseProjectIds.length).toBe(SHOWCASE_SIZE);
	expect(new Set(showcaseProjectIds).size).toBe(SHOWCASE_SIZE);

	// Re-derive the biggest projects straight from the weights: an independent
	// implementation of the same rule, so a broken comparator cannot pass both.
	const biggest = [...projectIds].sort((first, second) =>
		projectWeights[second] - projectWeights[first] || entries[first].title.localeCompare(entries[second].title),
	);
	expect([...showcaseProjectIds].sort()).toEqual(biggest.slice(0, SHOWCASE_SIZE).sort());
});