# Changelog

## [0.3.0](https://github.com/marcosgilf/timer/compare/v0.2.0...v0.3.0) (2026-08-12)


### Features

* **countdown:** add configurable count direction ([eefdcc1](https://github.com/marcosgilf/timer/commit/eefdcc1f0057789598de1877297cda6aa8940ed0))
* **ux:** add routed countdown configuration ([826c516](https://github.com/marcosgilf/timer/commit/826c516fab6664302f0cdc7110dbc24c4f4487a1))
* **ux:** add up navigation to countdown ([1b1a123](https://github.com/marcosgilf/timer/commit/1b1a1239cbb5e97e62154e8aff2b7f516409e9c0))
* **ux:** reflect paused state in URL ([78c39bc](https://github.com/marcosgilf/timer/commit/78c39bc7cd100d11bb569dfc52e45721e910e7f1))
* **ux:** simplify countdown configuration ([bab9bdc](https://github.com/marcosgilf/timer/commit/bab9bdce312499e11d721b51227bcb2c10e77ecc))


### Bug Fixes

* **a11y:** make stepper buttons individually focusable ([71f6cb2](https://github.com/marcosgilf/timer/commit/71f6cb23ab95aff87d9e059c9b33dd519c6177e6))
* **countdown:** step seconds by one ([879fda1](https://github.com/marcosgilf/timer/commit/879fda1e4e2adf5919dd880078513d5002131fad))
* **pwa:** preserve routed countdown pages ([5e1581f](https://github.com/marcosgilf/timer/commit/5e1581fd80e65088ac0ac990c3440430519f0def))
* **ux:** fit configuration display on desktop ([1e6d841](https://github.com/marcosgilf/timer/commit/1e6d841ef53e5a163b761082838230c6b5ac6bc2))
* **ux:** reserve done status space ([f8f2989](https://github.com/marcosgilf/timer/commit/f8f2989a9cc74364c9231042af3c6e1ab93319c0))
* **ux:** reserve version footer space ([ed102a9](https://github.com/marcosgilf/timer/commit/ed102a9147af8017a75bf4d5aa5265afbe756779))

## [0.2.0](https://github.com/marcosgilf/timer/compare/v0.1.0...v0.2.0) (2026-08-11)


### Features

* **pwa:** make Timer installable and offline ([7a90f53](https://github.com/marcosgilf/timer/commit/7a90f53862f3cd4932ef9e229417780ba697daa1))


### Bug Fixes

* **chrono:** mirror count in title, enlarge landscape digits, shrink controls ([13da6d2](https://github.com/marcosgilf/timer/commit/13da6d29e0970698ef4ad6c92b51d609bd18d523))
* **infra:** update required workflow checks ([677dac0](https://github.com/marcosgilf/timer/commit/677dac00d70b889952555d39e169c41a295fa613))
* **pwa:** add air to app icon and reuse it as favicon ([2681bd7](https://github.com/marcosgilf/timer/commit/2681bd7fd69d897bf53d78d35f615e3773a856a0))
* **pwa:** remove update modal, auto-update on reload, show app version ([ec57c30](https://github.com/marcosgilf/timer/commit/ec57c30164f7a749e264daa6de9eff34bffa5641))

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
