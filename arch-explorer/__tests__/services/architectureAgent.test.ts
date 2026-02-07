import { queryArchitecture } from '../../src/services/architectureAgent';
import { generateText } from 'ai';

jest.mock('../../src/services/overpassService');
jest.mock('../../src/services/wikidataService');

const mockGenerateText = generateText as jest.MockedFunction<typeof generateText>;

const mockCoords = {
  latitude: 40.7484,
  longitude: -73.9857,
  altitude: null,
  accuracy: null,
  heading: null,
  speed: null,
};

describe('queryArchitecture', () => {
  beforeEach(() => {
    mockGenerateText.mockClear();
  });

  it('returns parsed buildings from AI response', async () => {
    const mockResponse = {
      buildings: [
        {
          id: 'b1',
          name: 'Empire State Building',
          address: '350 Fifth Avenue',
          style: 'Art Deco',
          yearBuilt: '1931',
          architect: 'Shreve, Lamb & Harmon',
          description: 'Iconic skyscraper',
          notableFeatures: ['Observatory', 'Lightning rod'],
          historicalSignificance: 'Cultural icon',
          distance: null,
          imageUrl: null,
          wikidataId: 'Q9188',
        },
      ],
      summary: 'Midtown Manhattan architecture',
    };

    mockGenerateText.mockResolvedValueOnce({
      text: JSON.stringify(mockResponse),
    } as any);

    const result = await queryArchitecture(mockCoords);

    expect(result.buildings).toHaveLength(1);
    expect(result.buildings[0].name).toBe('Empire State Building');
    expect(result.summary).toBe('Midtown Manhattan architecture');
  });

  it('returns empty buildings when response has no JSON', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: 'No buildings found in this area.',
    } as any);

    const result = await queryArchitecture({ ...mockCoords, latitude: 0, longitude: 0 });

    expect(result.buildings).toEqual([]);
    expect(result.summary).toBe('No architectural data found for this location.');
  });

  it('returns fallback on JSON parse error', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: '{ invalid json }}',
    } as any);

    const result = await queryArchitecture({ ...mockCoords, latitude: 0, longitude: 0 });

    expect(result.buildings).toEqual([]);
    // On parse error the raw text is used as summary
    expect(result.summary).toBeTruthy();
  });

  it('handles generateText throwing an error', async () => {
    mockGenerateText.mockRejectedValueOnce(new Error('API error'));

    await expect(
      queryArchitecture({ ...mockCoords, latitude: 40.7, longitude: -74.0 })
    ).rejects.toThrow('API error');
  });
});
