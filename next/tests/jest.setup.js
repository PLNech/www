import '@testing-library/jest-dom';

// Mock Next.js router for unit/integration tests
jest.mock('next/router', () => require('next-router-mock'));

// Mock next/dynamic to avoid async loading/act warnings in unit tests.
// It renders a null stub for dynamically imported components.
jest.mock('next/dynamic', () => {
  return () =>
    function DynamicStub() {
      return null;
    };
});
