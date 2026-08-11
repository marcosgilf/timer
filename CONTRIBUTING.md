# Contributing

Thanks for taking an interest. This is a small project — issues and pull requests are welcome.

## Getting started

Fork [marcosgilf/timer](https://github.com/marcosgilf/timer), then clone your fork:

```sh
git clone git@github.com:<YOUR_USERNAME>/timer.git
cd timer
pnpm install
pnpm dev
```

Node `>=22.12` and pnpm are required (see `engines` in `package.json`).

## Working on a change

```sh
git checkout -b my-awesome-fix
```

Before pushing:

```sh
pnpm check   # astro check (types) + oxlint + oxfmt
pnpm test    # vitest
```

Both run automatically — `pre-commit` formats and type-checks staged files, `pre-push` runs
`pnpm check && pnpm test`. End-to-end tests are manual: `pnpm test:e2e`.

## How this project is planned

Decisions live in [`issues/`](./issues), a local markdown issue tracker, and are folded into
[`docs/spec.md`](./docs/spec.md). [`CONTEXT.md`](./CONTEXT.md) is the glossary — use its vocabulary in
code and in pull requests. If a change contradicts a decision recorded in `issues/`, say so in the
pull request rather than quietly diverging.

## Pull requests

Use Conventional Commits for PR titles / squash commit messages so Release Please can version the app:

- `feat:` for user-visible functionality
- `fix:` for bug fixes
- `docs:` and `chore:` for non-release changes

- One concern per pull request; keep the diff as small as the change allows.
- Explain *why*, not just what — the what is in the diff.
- Update `docs/spec.md` when behaviour changes, and `CONTEXT.md` when vocabulary does.
- Tests belong with any change to the pure core (`phaseAt`, cue scheduling, persistence parsing).

## Reporting bugs

Open an issue on GitHub with what you did, what you expected, what happened, and your
browser/OS/device — platform behaviour (audio, wake lock, background tabs) varies wildly, so the
device matters.
