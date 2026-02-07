import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BuildingCard } from "../src/components";
import { MapPinIcon } from "phosphor-react-native";
import type { ArchitecturalDetail } from "../src/types";
import { colors, fonts, cardStyle } from "../src/theme";

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
        <MapPinIcon size={48} color={colors.textTertiary} weight="light" />
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
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  summaryCard: {
    ...cardStyle,
    marginBottom: 16,
  },
  summaryLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  summaryText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  buildingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textSecondary,
  },
  emptyHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: "center",
  },
});
