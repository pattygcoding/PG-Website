import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Build/test configuration that replaces the Create React App toolchain
// (react-scripts + react-app-rewired + config-overrides.js).
export default defineConfig({
    // The site is served from the domain root (see public/CNAME), so every
    // emitted asset resolves from "/".
    base: "/",
    plugins: [react()],
    resolve: {
        // Resolve the "@/*" -> "./src/*" alias straight from tsconfig.json
        // (Vite's built-in support; no vite-tsconfig-paths plugin needed).
        tsconfigPaths: true,
    },
    // Cross-origin isolation exposes SharedArrayBuffer, which the Tiger runtime
    // needs to answer input(). The dev server sends the two headers here; the
    // static host (GitHub Pages) cannot, so public/coi-serviceworker.js adds
    // them there. Google Fonts send Cross-Origin-Resource-Policy, so COEP does
    // not block them.
    server: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
    },
    preview: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
    },
    build: {
        // Keep CRA's output directory so `postbuild` (OG pages/redirects) and
        // `predeploy`/`gh-pages` continue to work unchanged.
        outDir: "build",
        // Replaces CRA's GENERATE_SOURCEMAP=false in .env.
        sourcemap: false,
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./vitest.setup.ts",
    },
});
