const path = require('path');

module.exports = {
  // Pin the file-tracing root to this project. Without it, Next walks up and
  // finds a stray lockfile in a parent dir (~/package-lock.json) and infers the
  // wrong workspace root. Also makes standalone output tracing correct for
  // self-hosting off Vercel later.
  outputFileTracingRoot: __dirname,
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};
