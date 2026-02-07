import { View, Text, StyleSheet } from "react-native";
import { MapPinIcon } from "phosphor-react-native";
import type { Coordinates } from "../types";
import { LoadingView } from "./LoadingView";
import { colors, fonts, cardStyle } from "../theme";

interface LocationDisplayProps {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
}

export function LocationDisplay({
  coordinates,
  loading,
  error,
}: LocationDisplayProps) {
  if (loading) {
    return <LoadingView variant="location" />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!coordinates) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No location data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapPinIcon size={16} color={colors.textTertiary} weight="regular" />
      <Text style={styles.label}>Your Location</Text>
      <Text style={styles.coords}>
        {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
      </Text>
      {coordinates.accuracy != null && (
        <Text style={styles.accuracy}>
          ±{Math.round(coordinates.accuracy)}m accuracy
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...cardStyle,
    marginBottom: 16,
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  coords: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  accuracy: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textTertiary,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.error,
  },
  noDataText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textTertiary,
  },
});
