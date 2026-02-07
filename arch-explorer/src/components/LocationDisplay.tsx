import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import type { Coordinates } from "../types";

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
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#6366f1" />
        <Text style={styles.loadingText}>Getting location...</Text>
      </View>
    );
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
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  coords: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    fontVariant: ["tabular-nums"],
  },
  accuracy: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
  },
  noDataText: {
    fontSize: 14,
    color: "#888",
  },
});
