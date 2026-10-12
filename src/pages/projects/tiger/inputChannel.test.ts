import { createInputChannel } from "./inputChannel";

const hasSharedArrayBuffer = typeof SharedArrayBuffer !== "undefined";

test("returns null when no shared buffer is available", () => {
	expect(createInputChannel(null)).toBeNull();
	expect(createInputChannel(undefined)).toBeNull();
});

test.runIf(hasSharedArrayBuffer)("writes a line into the shared buffer and flags it ready", () => {
	const shared = new SharedArrayBuffer(8 + 64);
	const control = new Int32Array(shared, 0, 2);
	const text = new Uint8Array(shared, 8);
	const channel = createInputChannel(shared)!;
	channel.write("hello");
	expect(Atomics.load(control, 0)).toBe(1);
	expect(Atomics.load(control, 1)).toBe(5);
	expect(new TextDecoder().decode(text.subarray(0, 5))).toBe("hello");
});

test.runIf(hasSharedArrayBuffer)("signals end of input", () => {
	const shared = new SharedArrayBuffer(8 + 64);
	const control = new Int32Array(shared, 0, 2);
	createInputChannel(shared)!.end();
	expect(Atomics.load(control, 0)).toBe(-1);
});
