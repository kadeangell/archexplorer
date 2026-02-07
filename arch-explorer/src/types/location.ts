export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface LocationState {
  coordinates: Coordinates | null;
  error: string | null;
  loading: boolean;
  permissionGranted: boolean;
}
