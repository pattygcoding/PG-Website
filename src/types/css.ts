import type { CSSProperties } from "react";

/**
 * A style object that also accepts CSS custom properties (e.g. `--star-x`),
 * which React's built-in `CSSProperties` type does not model.
 */
export type CssVariables = CSSProperties & { [key: `--${string}`]: string | number };
