export default {
  "*.{ts,tsx,js,jsx,mjs,mts}": ["pnpm format", () => "pnpm check:types"],
  // oxlint parses .astro (frontmatter + <script>); oxfmt does not format them.
  "*.astro": ["oxlint --fix", () => "pnpm check:types"],
};
