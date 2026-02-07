import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Location from "expo-location";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
export const BACKGROUND_LOCATION_TASK = "background-location-task";

const openai = createOpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Module-level state for throttling notifications by distance
let lastNotificationLocation: { latitude: number; longitude: number } | null =
  null;

const NOTIFICATION_DISTANCE_THRESHOLD = 200; // meters

/**
 * Calculate the distance between two lat/lon points using the Haversine formula.
 * Returns distance in meters.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Request notification permissions from the user.
 * Returns true if permissions were granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn("Notifications only work on physical devices");
    return false;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Schedule an immediate local notification with an architecture fact.
 */
export async function scheduleArchitectureFact(
  title: string,
  body: string
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null, // immediate
  });
}

/**
 * Handle a location update from the background task.
 * Throttled by distance — only fires a notification if the user has
 * moved at least NOTIFICATION_DISTANCE_THRESHOLD meters from the
 * last notification location.
 */
export async function handleLocationUpdate(
  latitude: number,
  longitude: number
): Promise<void> {
  // Throttle by distance
  if (lastNotificationLocation) {
    const distance = haversineDistance(
      lastNotificationLocation.latitude,
      lastNotificationLocation.longitude,
      latitude,
      longitude
    );
    if (distance < NOTIFICATION_DISTANCE_THRESHOLD) {
      return;
    }
  }

  // Update last notification location
  lastNotificationLocation = { latitude, longitude };

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Give me one fun architectural fact about buildings near latitude ${latitude}, longitude ${longitude} in 1-2 sentences. Be specific and interesting.`,
    });

    await scheduleArchitectureFact("Nearby Architecture", text);
  } catch (error) {
    console.error("Failed to generate architecture fact:", error);
  }
}

/**
 * Start background location updates.
 * Requests background location permission if not already granted.
 */
export async function startBackgroundLocation(): Promise<void> {
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();

  if (foregroundStatus !== "granted") {
    console.warn("Foreground location permission not granted");
    return;
  }

  const { status: backgroundStatus } =
    await Location.requestBackgroundPermissionsAsync();

  if (backgroundStatus !== "granted") {
    console.warn("Background location permission not granted");
    return;
  }

  const isTaskRegistered = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK
  ).catch(() => false);

  if (isTaskRegistered) {
    return; // Already running
  }

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 100, // meters
    deferredUpdatesInterval: 60000, // 1 minute
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Arch Explorer",
      notificationBody: "Discovering architecture nearby...",
    },
  });
}

/**
 * Stop background location updates.
 */
export async function stopBackgroundLocation(): Promise<void> {
  const isTaskRegistered = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK
  ).catch(() => false);

  if (isTaskRegistered) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}
