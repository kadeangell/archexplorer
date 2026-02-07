// The overpass service has a 10s throttle between requests at module level.
// Set a generous timeout for all tests in this file.
jest.setTimeout(30000);

import { queryNearbyBuildings } from '../../src/services/overpassService';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

describe('queryNearbyBuildings', () => {
  it('returns parsed buildings from Overpass API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          elements: [
            {
              id: 12345,
              tags: { name: 'Test Building', building: 'yes', wikidata: 'Q999' },
              center: { lat: 40.7128, lon: -74.006 },
            },
            {
              id: 67890,
              tags: { name: 'Another Building', building: 'yes' },
              center: { lat: 40.7129, lon: -74.007 },
            },
          ],
        }),
    });

    const result = await queryNearbyBuildings(40.7128, -74.006, 300);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      osmId: '12345',
      name: 'Test Building',
      lat: 40.7128,
      lon: -74.006,
      wikidataId: 'Q999',
      tags: { name: 'Test Building', building: 'yes', wikidata: 'Q999' },
    });
    expect(result[1].wikidataId).toBeUndefined();
  });

  it('returns empty array on non-OK response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await queryNearbyBuildings(40.7128, -74.006, 300);

    expect(result).toEqual([]);
  });

  it('filters elements without name or center', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          elements: [
            {
              id: 1,
              tags: { building: 'yes' }, // no name
              center: { lat: 40.7, lon: -74.0 },
            },
            {
              id: 2,
              tags: { name: 'Good Building', building: 'yes' },
              // no center
            },
            {
              id: 3,
              tags: { name: 'Valid Building', building: 'yes' },
              center: { lat: 40.71, lon: -74.01 },
            },
          ],
        }),
    });

    const result = await queryNearbyBuildings(40.7128, -74.006, 300);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Valid Building');
  });
});
