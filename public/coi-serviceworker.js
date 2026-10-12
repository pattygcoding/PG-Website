/*
 * Adds the cross-origin isolation headers the Tiger runtime needs.
 *
 * The Rust runtime answers input() through a SharedArrayBuffer, which browsers
 * only expose to cross-origin-isolated pages. That normally comes from the
 * server sending COOP and COEP, but GitHub Pages cannot, so this worker
 * re-serves the relevant responses with the headers.
 *
 * Scope is "/", not "/tiger": a page is handled by exactly one controlling
 * worker, and that worker only sees requests whose URL falls inside its scope.
 * The /tiger document loads the runtime from /wasm, so the same registration
 * has to cover both. Only /tiger navigations receive COOP/COEP, so the rest of
 * the site is never cross-origin isolated.
 *
 * The runtime's dedicated worker ("/wasm/tiger-worker.js") must carry
 * `Cross-Origin-Embedder-Policy: require-corp` itself. When the owning document
 * is isolated, the browser refuses to load a dedicated worker whose script
 * response does not declare the same policy, which is what surfaced as
 * "Failed to load WASM engine" on the deployed site. The scripts the worker
 * imports (/wasm/tiger.js) and the module it fetches (/wasm/tiger.wasm) get the
 * header too, so the worker's own loads stay consistent.
 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    // Only this origin's own resources are ours to annotate.
    if (url.origin !== self.location.origin) return;

    const isTigerNavigation = event.request.mode === "navigate"
        && (url.pathname === "/tiger" || url.pathname.startsWith("/tiger/"));
    // Only the Tiger runtime files, not every /wasm/ asset (the formatter ships
    // its own unrelated module there).
    const isRuntimeAsset = url.pathname.startsWith("/wasm/tiger");

    // Everything else falls through to the network untouched.
    if (!isTigerNavigation && !isRuntimeAsset) return;

    event.respondWith(
        fetch(event.request).then((response) => {
            const headers = new Headers(response.headers);
            if (isTigerNavigation) {
                headers.set("Cross-Origin-Opener-Policy", "same-origin");
                headers.set("Cross-Origin-Embedder-Policy", "require-corp");
            }
            if (isRuntimeAsset) {
                headers.set("Cross-Origin-Embedder-Policy", "require-corp");
            }
            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers,
            });
        })
    );
});
