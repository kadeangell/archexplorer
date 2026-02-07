import { useState, useEffect, useCallback, useRef } from "react";
import * as Location from "expo-location";
import type { LocationState, Coordinates } from "../types";

const DEFAULT_STATE: LocationState = {
  coordinates: null,
  error: null,
  loading: true,
  permissionGranted: false,
};

export function useLocation() {
  const [state, setState] = useState<LocationState>(DEFAULT_STATE);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const requestPermission = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Location permission denied",
        permissionGranted: false,
      }));
      return false;
    }

    setState((prev) => ({ ...prev, permissionGranted: true }));
    return true;
  }, []);

  const startWatching = useCallback(async () => {
    if (watchRef.current) return;

    const granted = await requestPermission();
    if (!granted) return;

    // Get initial position quickly
    try {
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords: Coordinates = {
        latitude: initial.coords.latitude,
        longitude: initial.coords.longitude,
        altitude: initial.coords.altitude,
        accuracy: initial.coords.accuracy,
        heading: initial.coords.heading,
        speed: initial.coords.speed,
      };
      setState((prev) => ({ ...prev, coordinates: coords, loading: false }));
    } catch (e) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to get initial position",
      }));
    }

    // Start watching for continuous updates
    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10, // Update every 10 meters
        timeInterval: 5000, // Or every 5 seconds
      },
      (location) => {
        const coords: Coordinates = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          heading: location.coords.heading,
          speed: location.coords.speed,
        };
        setState((prev) => ({
          ...prev,
          coordinates: coords,
          loading: false,
          error: null,
        }));
      }
    );
  }, [requestPermission]);

  const stopWatching = useCallback(() => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
  }, []);

  useEffect(() => {
    startWatching();
    return () => stopWatching();
  }, [startWatching, stopWatching]);

  return {
    ...state,
    refresh: startWatching,
    stopWatching,
  };
}
