import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import type { ImageConversationResult } from "../types";

interface ImageConversationProps {
  result: ImageConversationResult | null;
  loading: boolean;
  error: string | null;
}

export function ImageConversation({ result, loading, error }: ImageConversationProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Analyzing architecture...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!result) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Analysis</Text>
        <Text style={styles.analysisText}>{result.analysis}</Text>
      </View>

      <View style={styles.badgeRow}>
        {result.architecturalStyle && (
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Style</Text>
            <Text style={styles.badgeText}>{result.architecturalStyle}</Text>
          </View>
        )}
        {result.estimatedEra && (
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Era</Text>
            <Text style={styles.badgeText}>{result.estimatedEra}</Text>
          </View>
        )}
      </View>

      {result.notableFeatures.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Notable Features</Text>
          {result.notableFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureBullet}>{"\u2022"}</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6366f1",
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flex: 1,
    backgroundColor: "#eef2ff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4338ca",
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  featureBullet: {
    fontSize: 15,
    color: "#6366f1",
    marginRight: 8,
    lineHeight: 22,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
});
