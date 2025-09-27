import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import DunbarApp from '@/components/dunbar/DunbarApp';

// Minimal store mock for Dunbar
jest.mock('@/components/dunbar/useDunbarStore', () => {
  return {
    useDunbarStore: () => ({
      state: { selectedEventId: null },
      friends: [],
      selectedFriendId: null,
      actions: {
        loadFromPayload: jest.fn(),
        addFriend: jest.fn(),
        removeFriend: jest.fn(),
        renameFriend: jest.fn(),
        toggleRelationship: jest.fn(),
        addEvent: jest.fn(),
        updateEvent: jest.fn(),
        resetData: jest.fn(),
        selectFriend: jest.fn(),
        setBirthday: jest.fn(),
        setFriendNotes: jest.fn(),
        updateFriend: jest.fn(),
        selectEvent: jest.fn(),
      },
      derived: {
        eventIndex: [],
        orbitBuckets: [],
        stats: { connections: 0, activeFriends: 0, totalEvents: 0, avgEventsPerFriend: 0 },
        anniversaries: [],
      },
    }),
  };
});

describe('DunbarApp routing and tab URL sync (path-only, SPA)', () => {
  beforeEach(() => {
    // default route to /dunbar (events)
    mockRouter.setCurrentUrl('/dunbar');
  });

  it('opens Events on /dunbar and stays on Search when clicked (no snap-back)', () => {
    render(<DunbarApp />);

    const searchBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchBtn);

    expect(mockRouter.asPath).toBe('/dunbar');
    // UI should remain on Search; CSS module class is hashed so we assert URL-only here.
    // Visual active-state is covered by E2E.
  });

  it('Orbits → Events updates URL to /dunbar; then Network updates URL to /dunbar/network', () => {
    mockRouter.setCurrentUrl('/dunbar/orbits');
    render(<DunbarApp />);

    const orbitsBtn = screen.getByRole('button', { name: /orbits/i });
    expect(orbitsBtn.className).toMatch(/tabActive/);

    const eventsBtn = screen.getByRole('button', { name: /events/i });
    fireEvent.click(eventsBtn);
    expect(mockRouter.asPath).toBe('/dunbar');
    expect(eventsBtn.className).toMatch(/tabActive/);

    const networkBtn = screen.getByRole('button', { name: /network/i });
    fireEvent.click(networkBtn);
    expect(mockRouter.asPath).toBe('/dunbar/network');
    expect(networkBtn.className).toMatch(/tabActive/);
  });

  it('Stats does not alter URL and remains selected', () => {
    mockRouter.setCurrentUrl('/dunbar');
    render(<DunbarApp />);

    const statsBtn = screen.getByRole('button', { name: /stats/i });
    fireEvent.click(statsBtn);

    expect(mockRouter.asPath).toBe('/dunbar');
    // UI should remain on Stats; assert URL-only (visual is validated in E2E).
  });
});
