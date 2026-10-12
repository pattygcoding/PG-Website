/*
 * Adds the cross-origin isolation headers the Tiger runtime needs.
 *
 * The Rust runtime answers input() through a SharedArrayBuffer, which browsers
 * only expose to cross-origin-isolated pages. That normally comes from the
 * server sending COOP and COEP, but GitHub Pages cannot, so this worker
 * re-serves navigations in its scope with both headers. It only touches
 * navigation responses: the document's COEP already allows the same-origin
 * assets and the Google Fonts (which send Cross-Origin-Resource-Policy).
 *
 * The Tiger page registers it with scope "/tiger" and reloads once, so the
 * rest of the site is never cross-origin isolated. Without isolation the
 * runtime still runs and input() reports that no stream is connected.
 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
    if (event.request.mode !== "navigate") return;
    event.respondWith(
        fetch(event.request).then((response) => {
            const headers = new Headers(response.headers);
            headers.set("Cross-Origin-Opener-Policy", "same-origin");
            headers.set("Cross-Origin-Embedder-Policy", "require-corp");
            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers,
            });
        })
    );
});
