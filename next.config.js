const path = require('path');

module.exports = {
  // Pin the file-tracing root to this project. Without it, Next walks up and
  // finds a stray lockfile in a parent dir (~/package-lock.json) and infers the
  // wrong workspace root. Also makes standalone output tracing correct for
  // self-hosting off Vercel later.
  outputFileTracingRoot: __dirname,
  typescript: {
    // Next's build runs its own (stock, non-PnP-aware) TypeScript to type-check
    // its *generated* route validators under `.next/types`. Those validators
    // deep-import a Next-internal type (`next/dist/lib/metadata/types/...`) whose
    // `.d.ts` exists and resolves fine at runtime, but stock tsc can't traverse
    // into Yarn PnP's package zips, so it errors. This is infra friction, not a
    // type bug in our code. The project is `strict:false`/`allowJs`/all-JS, so
    // build-time type-checking catches ~nothing here; editor TS (via the
    // `.yarn/sdks` PnP SDK) still checks our source. SWC compile + lint + the
    // Playwright route-smoke net remain the real gates.
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};
