import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BuildingCard } from "../src/components";
import type { ArchitecturalDetail } from "../src/types";

export default function DetailsScreen() {
  const params = useLocalSearchParams<{
    buildings?: string;
    summary?: string;
  }>();

  let buildings: ArchitecturalDetail[] = [];
  try {
    buildings = params.buildings ? JSON.parse(params.buildings) : [];
  } catch {
    buildings = [];
  }

  const summary = params.summary || "";

  if (buildings.length === 0 && !summary) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No architectural data available.
        </Text>
        <Text style={styles.emptyHint}>
          Go back and explore a location to see details.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {summary ? (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Area Overview</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      ) : null}

      {buildings.length > 0 && (
        <View style={styles.buildingsSection}>
          <Text style={styles.sectionTitle}>
            Nearby Buildings ({buildings.length})
          </Text>
          {buildings.map((building, index) => (
            <BuildingCard key={building.id || index} building={building} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  buildingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
});
