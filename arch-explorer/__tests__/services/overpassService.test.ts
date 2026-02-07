import { queryNearbyBuildingsWikidata } from '../../src/services/wikidataService';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

describe('queryNearbyBuildingsWikidata', () => {
  it('returns parsed buildings from Wikidata SPARQL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: {
            bindings: [
              {
                building: { value: 'http://www.wikidata.org/entity/Q9188' },
                buildingLabel: { value: 'Empire State Building' },
                coord: { value: 'Point(-73.9857 40.7484)' },
                styleLabel: { value: 'Art Deco' },
                architectLabel: { value: 'Shreve, Lamb & Harmon' },
                inception: { value: '1931-01-01T00:00:00Z' },
                image: {
                  value: 'http://commons.wikimedia.org/wiki/Special:FilePath/Empire_State_Building.jpg',
                },
                floors: { value: '102' },
              },
            ],
          },
        }),
    });

    const result = await queryNearbyBuildingsWikidata(40.7484, -73.9857);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      wikidataId: 'Q9188',
      name: 'Empire State Building',
      style: 'Art Deco',
      architect: 'Shreve, Lamb & Harmon',
      yearBuilt: '1931',
      floors: 102,
    });
    expect(result[0].imageUrl).toContain('commons.wikimedia.org');
    expect(result[0].lat).toBeCloseTo(40.7484);
    expect(result[0].lon).toBeCloseTo(-73.9857);
  });

  it('deduplicates buildings by Q-id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: {
            bindings: [
              {
                building: { value: 'http://www.wikidata.org/entity/Q9188' },
                buildingLabel: { value: 'Empire State Building' },
                coord: { value: 'Point(-73.9857 40.7484)' },
                styleLabel: { value: 'Art Deco' },
              },
              {
                building: { value: 'http://www.wikidata.org/entity/Q9188' },
                buildingLabel: { value: 'Empire State Building' },
                coord: { value: 'Point(-73.9857 40.7484)' },
                styleLabel: { value: 'Streamline Moderne' },
              },
            ],
          },
        }),
    });

    const result = await queryNearbyBuildingsWikidata(40.7484, -73.9857);

    expect(result).toHaveLength(1);
  });

  it('skips items with no English label', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: {
            bindings: [
              {
                building: { value: 'http://www.wikidata.org/entity/Q12345' },
                buildingLabel: { value: 'Q12345' },
                coord: { value: 'Point(-74.0 40.7)' },
              },
            ],
          },
        }),
    });

    const result = await queryNearbyBuildingsWikidata(40.7, -74.0);

    expect(result).toHaveLength(0);
  });

  it('returns empty array on non-OK response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await queryNearbyBuildingsWikidata(40.7128, -74.006);

    expect(result).toEqual([]);
  });

  it('returns empty array on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await queryNearbyBuildingsWikidata(40.7128, -74.006);

    expect(result).toEqual([]);
  });

  it('handles missing optional fields gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: {
            bindings: [
              {
                building: { value: 'http://www.wikidata.org/entity/Q555' },
                buildingLabel: { value: 'Simple Building' },
                coord: { value: 'Point(-74.0 40.7)' },
              },
            ],
          },
        }),
    });

    const result = await queryNearbyBuildingsWikidata(40.7, -74.0);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Simple Building');
    expect(result[0].style).toBeUndefined();
    expect(result[0].architect).toBeUndefined();
    expect(result[0].yearBuilt).toBeUndefined();
    expect(result[0].imageUrl).toBeUndefined();
    expect(result[0].floors).toBeUndefined();
  });
});
