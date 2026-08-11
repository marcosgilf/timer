# Changelog

## [0.1.0](https://github.com/marcosgilf/timer/compare/v0.0.1...v0.1.0) (2026-08-11)


### Features

* **chrono:** the landing page is the timer (ticket 23) ([#5](https://github.com/marcosgilf/timer/issues/5)) ([7090f37](https://github.com/marcosgilf/timer/commit/7090f3764398d8d0415dbd5f2fe5e5a98565a9d6))
* **pwa:** make Timer installable and offline ([7a90f53](https://github.com/marcosgilf/timer/commit/7a90f53862f3cd4932ef9e229417780ba697daa1))
* spec, OSS files and CI/deploy ([32f121c](https://github.com/marcosgilf/timer/commit/32f121c01d30019662e0f7b64a15b54139cec86d))


### Bug Fixes

* **chrono:** mirror count in title, enlarge landscape digits, shrink controls ([13da6d2](https://github.com/marcosgilf/timer/commit/13da6d29e0970698ef4ad6c92b51d609bd18d523))
* **pwa:** add air to app icon and reuse it as favicon ([2681bd7](https://github.com/marcosgilf/timer/commit/2681bd7fd69d897bf53d78d35f615e3773a856a0))
* **pwa:** remove update modal, auto-update on reload, show app version ([ec57c30](https://github.com/marcosgilf/timer/commit/ec57c30164f7a749e264daa6de9eff34bffa5641))

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
