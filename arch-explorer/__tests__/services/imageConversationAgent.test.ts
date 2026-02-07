import { analyzeArchitectureImage } from '../../src/services/imageConversationAgent';
import { generateText } from 'ai';

const mockGenerateText = generateText as jest.MockedFunction<typeof generateText>;

describe('analyzeArchitectureImage', () => {
  beforeEach(() => {
    mockGenerateText.mockClear();
  });

  it('returns parsed analysis from AI response', async () => {
    const mockResponse = {
      analysis: 'This is a Gothic Revival church.',
      architecturalStyle: 'Gothic Revival',
      estimatedEra: '19th century',
      notableFeatures: ['Flying buttresses', 'Rose window'],
    };

    mockGenerateText.mockResolvedValueOnce({
      text: JSON.stringify(mockResponse),
    } as any);

    const result = await analyzeArchitectureImage('base64data');

    expect(result.analysis).toBe('This is a Gothic Revival church.');
    expect(result.architecturalStyle).toBe('Gothic Revival');
    expect(result.estimatedEra).toBe('19th century');
    expect(result.notableFeatures).toEqual(['Flying buttresses', 'Rose window']);
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
  });

  it('returns raw text when response has no JSON', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: 'This building looks interesting but I cannot parse it as JSON.',
    } as any);

    const result = await analyzeArchitectureImage('base64data');

    expect(result.analysis).toBe(
      'This building looks interesting but I cannot parse it as JSON.'
    );
    expect(result.architecturalStyle).toBeNull();
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
  });

  it('returns error result on exception', async () => {
    mockGenerateText.mockRejectedValueOnce(new Error('Vision API failed'));

    const result = await analyzeArchitectureImage('base64data');

    expect(result.error).toBe('Vision API failed');
    expect(result.analysis).toBe('');
    expect(result.loading).toBe(false);
  });
});
