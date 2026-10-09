// Ambient declarations for globals that TypeScript's bundled lib does not ship.

// TypeScript 4.9's lib.es2018.intl omits Intl.getCanonicalLocales, which this
// project relies on at runtime (supported in all modern browsers). Declaring it
// here merges into the built-in Intl namespace.
declare namespace Intl {
	function getCanonicalLocales(locales: string | string[]): string[];
}

// React 18's act() reads this flag, which tests toggle via `global`.
declare var IS_REACT_ACT_ENVIRONMENT: boolean;

// WASM glue loaded from public/wasm_exec.js at runtime (Tiger and Formatter pages).
interface Window {
	Go: new () => {
		importObject: WebAssembly.Imports;
		run: (instance: WebAssembly.Instance) => Promise<void>;
	};
	formatInput: (source: string, mode: string) => string;
}
