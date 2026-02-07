import { getWikidataImages } from '../../src/services/wikidataService';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

describe('getWikidataImages', () => {
  it('returns image map for given wikidata IDs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: {
            bindings: [
              {
                building: { value: 'http://www.wikidata.org/entity/Q12345' },
                image: {
                  value:
                    'http://commons.wikimedia.org/wiki/Special:FilePath/TestImage.jpg',
                },
              },
            ],
          },
        }),
    });

    const result = await getWikidataImages(['Q12345']);

    expect(result).toHaveProperty('Q12345');
    expect(result['Q12345']).toContain('commons.wikimedia.org');
    expect(result['Q12345']).toContain('width=800');
  });

  it('returns empty object for empty wikidataIds', async () => {
    const result = await getWikidataImages([]);

    expect(result).toEqual({});
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns empty object on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await getWikidataImages(['Q999']);

    expect(result).toEqual({});
  });

  it('returns empty object on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await getWikidataImages(['Q999']);

    expect(result).toEqual({});
  });

  it('skips bindings without valid Q-id or image', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          results: {
            bindings: [
              {
                building: { value: 'http://example.com/no-qid' },
                image: { value: 'http://commons.wikimedia.org/wiki/Special:FilePath/Img.jpg' },
              },
              {
                building: { value: 'http://www.wikidata.org/entity/Q555' },
                image: { value: '' },
              },
            ],
          },
        }),
    });

    const result = await getWikidataImages(['Q555']);

    expect(Object.keys(result)).toHaveLength(0);
  });
});
