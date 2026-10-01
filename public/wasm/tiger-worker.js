// Runs tiger.wasm off the main thread so programs can block on input() and be stopped.
importScripts("/wasm/tiger_wasm_exec.js");

self.tigerOutput = (text) => self.postMessage({ type: "output", text });
self.tigerRequestInput = () => self.postMessage({ type: "input" });

async function initialize() {
	const go = new Go();
	const response = await fetch("/wasm/tiger.wasm");
	if (!response.ok) throw new Error(`Runtime download failed (${response.status})`);
	const result = await WebAssembly.instantiate(await response.arrayBuffer(), go.importObject);
	go.run(result.instance).catch((error) => {
		self.postMessage({ type: "fatal", error: error.message });
	});
	if (typeof self.tigerRun !== "function") throw new Error("Runtime did not initialize");
	self.postMessage({ type: "ready" });
}

self.onmessage = async (event) => {
	if (event.data.type === "input") {
		self.tigerProvideInput(event.data.text ?? null);
		return;
	}
	if (event.data.type !== "run") return;
	try {
		const result = await self.tigerRun(event.data.source, event.data.filename || "playground.tg");
		self.postMessage({ type: "result", error: result.error });
	} catch (error) {
		self.postMessage({ type: "fatal", error: error.message });
	}
};

initialize().catch((error) => self.postMessage({ type: "fatal", error: error.message }));
