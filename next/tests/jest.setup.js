import '@testing-library/jest-dom';

// Mock Next.js router for unit/integration tests
jest.mock('next/router', () => require('next-router-mock'));

 // Silences React-Force-Graph heavy canvas deps by redirecting to a light stub (see __mocks__)
jest.mock('react-force-graph-2d');

// Mock next/dynamic to avoid async loading/act warnings in unit tests.
// It renders a null stub for dynamically imported components.
jest.mock('next/dynamic', () => {
  return () =>
    function DynamicStub() {
      return null;
    };
});
