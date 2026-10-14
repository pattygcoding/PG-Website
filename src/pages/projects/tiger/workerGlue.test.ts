import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Guards the un-hashed runtime files the Tiger page ships from `public/wasm`.
 *
 * `public/wasm/tiger.js` is a copy of the Tiger runtime's `web/tiger.js`. It used
 * to decode the delivered line out of the shared buffer with `TextDecoder`, which
 * a browser refuses — "The provided ArrayBufferView value must not be shared" —
 * so `input()` failed the moment a line was typed. The delivered bytes now go
 * straight into WebAssembly memory, where Rust decodes them. These checks fail if
 * that path ever comes back, or if a half-finished cache bump leaves clients on
 * an old copy of the runtime.
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const read = (relative: string) => readFileSync(resolve(root, relative), "utf8");
const versionTags = (text: string) => [...text.matchAll(/\?v=(\d+)/g)].map((match) => match[1]);

describe("the Tiger worker glue", () => {
	test("never decodes the shared input buffer in JavaScript", () => {
		const glue = read("public/wasm/tiger.js");
		expect(glue).not.toMatch(/decode\(\s*sharedText/);
		expect(glue).toContain("writeBytes(linePointer, lineCapacity, sharedText.subarray(");
	});

	// The runtime files are served un-hashed, so one `?v=` tag has to bust the
	// browser cache for the page's worker, that worker's glue, and the module.
	test("busts the cache with one version for every runtime file", () => {
		const tags = [
			...versionTags(read("src/pages/projects/tiger/Tiger.tsx")),
			...versionTags(read("public/wasm/tiger-worker.js")),
			...versionTags(read("public/wasm/tiger.js")),
		];
		expect(tags.length).toBeGreaterThanOrEqual(3);
		expect(new Set(tags).size).toBe(1);
	});
});
