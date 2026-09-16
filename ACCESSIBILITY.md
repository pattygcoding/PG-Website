# Accessibility

This portfolio includes accessibility improvements informed by WCAG 2.2 A/AA.
It does not claim full WCAG conformance. The existing backgrounds, colors,
typography, layout, and normal animations are intentionally preserved.
Skip navigation and map focus indicators appear only during focus interaction.

## Implemented

- Focus-only skip navigation and a main landmark on every page.
- Focus moves into new content after client-side route navigation, without
  taking focus on the initial page load. Loading content has a status message.
- Immediate page titles, including a fallback title before React loads.
- Valid banner, navigation, and dialog semantics. The menu traps focus, makes
  background content inert, closes with Escape, and restores focus.
- Named social links and decorative icons excluded from accessible names.
- Standard language-selection buttons with selected state, searchable options,
  and focus restoration. Native language names have pronunciation metadata.
- Document language follows successfully loaded translations, with English
  metadata on fallback. Stale translation requests cannot override newer ones.
- Stable screen-reader text replaces repeated typewriter announcements while
  leaving the visible animation unchanged.
- Clipboard success/failure announcements and named live code-output regions.
- Keyboard country exploration using arrows, Home/End, and Enter/Space; Escape
  dismisses details. The map has one country in the Tab sequence and country
  names include language information for assistive technology.
- Keyboard-activated game direction controls retain focus. Loading the game
  does not automatically focus its canvas.

## Verification

Run `npm test -- --watchAll=false --runInBand` and `npm run build`.
The accessibility pass completed with 36 passing tests and a successful build.

Browser checks used axe-core 4.10.3 with WCAG A/AA tags through 2.2 and
best-practice rules on all nine routes, in both themes, at 1440x900 and 390x900.
The 36 route/theme/viewport scans found only color-contrast violations.
The open-menu scan passed after the dialog correction. Interaction checks
covered skip navigation, route focus, nested language dismissal, and map
keyboard handlers. No horizontal page overflow was detected at these sizes.

Measured layout, typography, and colors of the semantic markup changes matched
the original markup on the home and language pages at both viewport sizes.
Animations and transitions were frozen only in the test browser for stable
comparisons and contrast checks, not in the website itself.

## Remaining Limitations

- Contrast findings remain in home-page decorative code line numbers and
  dark-theme Tiger/formatter controls. Colors were not changed. Numerous
  text-over-image/background contrast cases still require manual evaluation.
- The existing animation behavior is preserved. Comprehensive pause/stop/hide
  controls and motion-related conformance have not been established.
- The embedded game still lacks a nonvisual representation of its board and
  gameplay state. Keyboard input alone does not make the game fully accessible.
- A complete NVDA/JAWS/VoiceOver, native keyboard, zoom/reflow, text-spacing,
  touch-target, and multilingual pronunciation audit remains necessary.
- Automated scans cover rendered states, not every filter, execution result,
  translation, or third-party runtime behavior. Passing scans are not a
  conformance certification.