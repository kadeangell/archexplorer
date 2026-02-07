import { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import MapView, { Region } from "react-native-maps";
import { useRouter } from "expo-router";
import { MapPinIcon, CrosshairSimpleIcon } from "phosphor-react-native";
import { useLocation, useArchitectureAgent } from "../src/hooks";
import { LoadingView } from "../src/components";
import { colors, fonts, primaryButtonStyle, primaryButtonDisabledStyle } from "../src/theme";
import type { Coordinates } from "../src/types";

const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = 0.01;

export default function MapScreen() {
  const router = useRouter();
  const location = useLocation();
  const architecture = useArchitectureAgent();
  const mapRef = useRef<MapView>(null);
  const initialRegionSet = useRef(false);

  const [centerCoords, setCenterCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const handleRegionChangeComplete = (region: Region) => {
    setCenterCoords({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  };

  const handleExplore = async () => {
    if (!centerCoords) return;
    const coords: Coordinates = {
      latitude: centerCoords.latitude,
      longitude: centerCoords.longitude,
      altitude: null,
      accuracy: null,
      heading: null,
      speed: null,
    };
    const result = await architecture.query(coords);
    if (result) {
      router.push({
        pathname: "/details",
        params: {
          buildings: JSON.stringify(result.buildings),
          summary: result.summary,
        },
      });
    }
  };

  const handleRecenter = () => {
    if (!location.coordinates || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      500
    );
  };

  // No permission
  if (!location.permissionGranted && !location.loading) {
    return (
      <View style={styles.centeredContainer}>
        <MapPinIcon size={64} color={colors.accent} weight="fill" />
        <Text style={styles.permissionTitle}>Location Access Required</Text>
        <Text style={styles.permissionText}>
          Grant location access to explore architecture on the map.
        </Text>
        <Pressable style={styles.grantButton} onPress={location.refresh}>
          <Text style={styles.grantButtonText}>Grant Access</Text>
        </Pressable>
      </View>
    );
  }

  // Loading GPS
  if (location.loading || !location.coordinates) {
    return <LoadingView variant="location" />;
  }

  // Query in progress
  if (architecture.loading) {
    return <LoadingView variant="architecture" />;
  }

  const initialRegion = !initialRegionSet.current
    ? {
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
    : undefined;

  if (!initialRegionSet.current) {
    initialRegionSet.current = true;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation
        userInterfaceStyle="dark"
        onRegionChangeComplete={handleRegionChangeComplete}
      />

      {/* Fixed center pin overlay */}
      <View style={styles.pinContainer} pointerEvents="none">
        <MapPinIcon size={48} color={colors.accent} weight="fill" />
        <View style={styles.pinDot} />
      </View>

      {/* Recenter button */}
      <Pressable style={styles.recenterButton} onPress={handleRecenter}>
        <CrosshairSimpleIcon size={22} color={colors.accent} weight="regular" />
      </Pressable>

      {/* Bottom control panel */}
      <View style={styles.bottomPanel}>
        {centerCoords && (
          <Text style={styles.coordsText}>
            {centerCoords.latitude.toFixed(5)}, {centerCoords.longitude.toFixed(5)}
          </Text>
        )}

        {architecture.error ? (
          <Text style={styles.errorText}>{architecture.error}</Text>
        ) : null}

        <Pressable
          style={[
            styles.exploreButton,
            !centerCoords && styles.exploreButtonDisabled,
          ]}
          onPress={handleExplore}
          disabled={!centerCoords}
        >
          <Text style={styles.exploreButtonText}>Explore This Area</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  permissionTitle: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  permissionText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textTertiary,
    textAlign: "center",
    marginBottom: 24,
  },
  grantButton: {
    ...primaryButtonStyle,
    paddingHorizontal: 32,
    paddingVertical: 14,
    padding: undefined,
  },
  grantButtonText: {
    fontFamily: fonts.body,
    color: colors.textOnAccent,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  pinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -24,
    marginTop: -48,
    alignItems: "center",
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: -4,
  },
  recenterButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(65, 83, 57, 0.92)",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(65, 83, 57, 0.92)",
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    padding: 20,
    paddingBottom: 40,
  },
  coordsText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: "center",
    marginBottom: 12,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.error,
    textAlign: "center",
    marginBottom: 12,
  },
  exploreButton: {
    ...primaryButtonStyle,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  exploreButtonDisabled: {
    ...primaryButtonDisabledStyle,
  },
  exploreButtonText: {
    fontFamily: fonts.body,
    color: colors.textOnAccent,
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
