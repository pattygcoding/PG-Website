/**
 * The page's half of the Tiger input channel.
 *
 * The Rust runtime has no goroutines, so the worker blocks in `Atomics.wait`
 * while a program waits on `input()` and cannot receive messages. The answer
 * therefore travels through a `SharedArrayBuffer` the page writes directly.
 *
 * This mirrors `createInputChannel` in `public/wasm/tiger.js`; keep the buffer
 * layout (two Int32 control words followed by the UTF-8 line) in sync with it.
 */
const STATE = 0; // control[0]: 0 waiting, 1 a line, -1 end of input
const LENGTH = 1; // control[1]: the delivered line's length in bytes
const TEXT = 8; // the delivered line's bytes begin past the control words

export interface InputChannel {
	/** Delivers a line to the blocked program. */
	write: (value: string) => void;
	/** Reports end of input, as Ctrl+D does on a terminal. */
	end: () => void;
}

/** Returns the channel for a runtime's shared buffer, or `null` when input is unavailable. */
export function createInputChannel(shared: SharedArrayBuffer | null | undefined): InputChannel | null {
	if (!shared) return null;
	const encoder = new TextEncoder();
	const control = new Int32Array(shared, STATE, 2);
	const text = new Uint8Array(shared, TEXT);
	return {
		write(value: string) {
			const bytes = encoder.encode(value).subarray(0, text.length);
			text.set(bytes);
			Atomics.store(control, LENGTH, bytes.length);
			Atomics.store(control, STATE, 1);
			Atomics.notify(control, STATE);
		},
		end() {
			Atomics.store(control, STATE, -1);
			Atomics.notify(control, STATE);
		},
	};
}
