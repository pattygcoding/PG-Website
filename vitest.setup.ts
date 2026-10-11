// Global test setup for Vitest (replaces the Create React App Jest bootstrap).
//
// The suites drive components through `react-dom/client` + `act()` directly,
// so no DOM matchers or testing-library wiring are required here. This file
// exists as the single home for shared jsdom shims; add them below as needed.
