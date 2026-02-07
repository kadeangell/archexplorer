import {
  haversineDistance,
  requestNotificationPermissions,
  scheduleArchitectureFact,
  handleLocationUpdate,
} from '../../src/services/notificationService';
import * as Notifications from 'expo-notifications';
import { generateText } from 'ai';

const mockGenerateText = generateText as jest.MockedFunction<typeof generateText>;

describe('haversineDistance', () => {
  it('returns ~111km for 1 degree latitude difference', () => {
    const distance = haversineDistance(0, 0, 1, 0);
    // 1 degree of latitude ≈ 111,195 meters
    expect(distance).toBeGreaterThan(110000);
    expect(distance).toBeLessThan(112000);
  });

  it('returns 0 for the same point', () => {
    const distance = haversineDistance(40.7128, -74.006, 40.7128, -74.006);
    expect(distance).toBe(0);
  });

  it('returns reasonable distance for known city pair', () => {
    // NYC to LA ≈ 3,944 km
    const distance = haversineDistance(40.7128, -74.006, 34.0522, -118.2437);
    expect(distance).toBeGreaterThan(3900000);
    expect(distance).toBeLessThan(4000000);
  });
});

describe('requestNotificationPermissions', () => {
  it('returns true when already granted', async () => {
    const result = await requestNotificationPermissions();
    expect(result).toBe(true);
  });
});

describe('scheduleArchitectureFact', () => {
  it('calls scheduleNotificationAsync with correct content', async () => {
    await scheduleArchitectureFact('Test Title', 'Test Body');

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: 'Test Title',
        body: 'Test Body',
        sound: true,
      },
      trigger: null,
    });
  });
});

describe('handleLocationUpdate', () => {
  beforeEach(() => {
    mockGenerateText.mockClear();
    (Notifications.scheduleNotificationAsync as jest.Mock).mockClear();
  });

  it('generates a fact and schedules notification on first call', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: 'Fun architecture fact!',
    } as any);

    await handleLocationUpdate(40.7128, -74.006);

    expect(mockGenerateText).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('throttles by distance - skips nearby location', async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: 'First fact',
    } as any);

    // First call sets the baseline
    await handleLocationUpdate(40.7128, -74.006);
    mockGenerateText.mockClear();
    (Notifications.scheduleNotificationAsync as jest.Mock).mockClear();

    // Second call very close by (< 200m) should be throttled
    await handleLocationUpdate(40.7129, -74.0061);

    expect(mockGenerateText).not.toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('fires notification for distant location', async () => {
    mockGenerateText.mockResolvedValue({
      text: 'Another fact',
    } as any);

    // First call
    await handleLocationUpdate(40.7128, -74.006);
    mockGenerateText.mockClear();
    (Notifications.scheduleNotificationAsync as jest.Mock).mockClear();

    // Second call far away (> 200m)
    await handleLocationUpdate(40.72, -74.02);

    expect(mockGenerateText).toHaveBeenCalledTimes(1);
  });
});
