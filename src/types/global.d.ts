// Ambient declarations for globals that TypeScript's bundled lib does not ship.

// TypeScript 4.9's lib.es2018.intl omits Intl.getCanonicalLocales, which this
// project relies on at runtime (supported in all modern browsers). Declaring it
// here merges into the built-in Intl namespace.
declare namespace Intl {
	function getCanonicalLocales(locales: string | string[]): string[];
}

// React 19's act() reads this flag, which tests toggle via `global`.
declare var IS_REACT_ACT_ENVIRONMENT: boolean;

// WASM glue lives in public/wasm and is loaded as a classic script at runtime.
// Tiger drives its Rust runtime through its own bridge (/wasm/tiger.js). The
// formatter's Rust bridge (/wasm/formatter.js) installs `formatInput` and
// `formatJSON` once `FormatterWasm.init` resolves.
interface FormatterWasmApi {
	init: (
		source: string | URL | ArrayBuffer | ArrayBufferView | WebAssembly.Module
	) => Promise<FormatterWasmApi>;
	format: (source: string, mode: string) => string;
	readonly loaded: boolean;
}

interface Window {
	FormatterWasm: FormatterWasmApi;
	formatInput: (source: string, mode: string) => string;
	formatJSON: (source: string, mode: string) => string;
}
