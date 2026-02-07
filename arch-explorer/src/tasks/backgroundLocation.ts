import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import {
  handleLocationUpdate,
  BACKGROUND_LOCATION_TASK,
} from "../services/notificationService";

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Background location error:", error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (locations && locations.length > 0) {
      const location = locations[locations.length - 1];
      await handleLocationUpdate(
        location.coords.latitude,
        location.coords.longitude
      );
    }
  }
});
