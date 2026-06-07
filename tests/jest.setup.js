import '@testing-library/jest-dom';

// Mock the App Router navigation hooks for unit/integration tests.
// (The app migrated off the Pages Router's next/router.)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock next/dynamic to avoid async loading/act warnings in unit tests.
// It renders a null stub for dynamically imported components.
jest.mock('next/dynamic', () => {
  return () =>
    function DynamicStub() {
      return null;
    };
});
