# Changelog

## 0.1.0 (2026-08-11)

### Features

- Ship the Chrono MVP: the landing page is the timer, with Start, Pause, Resume and Reset.
- Add a pure Clock domain model: elapsed time is derived from `Date.now()` rather than counted.
- Add room-readable neon-red digits on a dark clock face, capped at `99:59`.
- Mirror the live count in the browser tab title.
- Use semantic HTML and Pico CSS classless styling, with custom CSS only where the clock needs it.
- Meet the initial WCAG 2.2 AA accessibility bar: keyboard operation, visible focus, stable controls,
  large targets, and state announcements instead of per-second screen-reader updates.

### Notes

This is the first public release and intentionally includes only the count-up Chrono. PWA support,
countdown configuration and rounds are planned next.
