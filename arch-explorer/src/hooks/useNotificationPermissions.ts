import { useState, useEffect, useCallback } from "react";
import {
  requestNotificationPermissions,
  startBackgroundLocation,
  stopBackgroundLocation,
} from "../services/notificationService";

export function useNotificationPermissions() {
  const [hasPermission, setHasPermission] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const requestPermissions = useCallback(async () => {
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);
    return granted;
  }, []);

  const toggleNotifications = useCallback(async () => {
    if (notificationsEnabled) {
      await stopBackgroundLocation();
      setNotificationsEnabled(false);
    } else {
      const granted = await requestPermissions();
      if (granted) {
        await startBackgroundLocation();
        setNotificationsEnabled(true);
      }
    }
  }, [notificationsEnabled, requestPermissions]);

  useEffect(() => {
    return () => {
      stopBackgroundLocation();
    };
  }, []);

  return {
    hasPermission,
    notificationsEnabled,
    toggleNotifications,
    requestPermissions,
  };
}
