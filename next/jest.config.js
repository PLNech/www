const nextJest = require('next/jest');

/**
 * Jest config for the Next.js app (root: next/).
 * Uses next/jest SWC transformer and jsdom environment.
 * Yarn PnP compatible via jest-pnp-resolver.
 */
const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  resolver: 'jest-pnp-resolver',
  // Enable RTL matchers and router mocks
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  moduleNameMapper: {
    // Support @/ alias → next/ path root
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
  ],
  // Allow JSX in tests without explicit React import if using React 17+ JSX transform
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  // Make sure Jest can find our mocks
  moduleDirectories: ['node_modules', '<rootDir>'],
};

module.exports = createJestConfig(customJestConfig);
