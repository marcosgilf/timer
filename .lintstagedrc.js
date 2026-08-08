// Tasks receive the staged file paths, so formatters only ever touch what is being committed.
// Never call `pnpm format` here: it runs `oxfmt --write .` over the whole repo, rewriting files
// lint-staged will not re-stage — which lands unformatted code in the commit while the working tree
// looks clean.
export default {
  "*.{ts,tsx,js,jsx,mjs,mts}": ["oxlint --fix", "oxfmt --write", () => "pnpm check:types"],
  "*.astro": ["oxlint --fix", () => "pnpm check:types"],
  "*.{css,json,jsonc}": ["oxfmt --write"],
};
