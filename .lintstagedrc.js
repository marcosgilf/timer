export default {
  "*.{ts,tsx,js,jsx,mjs,mts}": ["pnpm format", () => "pnpm check:types"],
  "*.astro": [() => "pnpm check:types"],
};
