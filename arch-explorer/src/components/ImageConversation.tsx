import { View, Text, StyleSheet } from "react-native";
import type { ImageConversationResult } from "../types";
import { LoadingView } from "./LoadingView";
import { colors, fonts, cardStyle } from "../theme";

interface ImageConversationProps {
  result: ImageConversationResult | null;
  loading: boolean;
  error: string | null;
}

export function ImageConversation({ result, loading, error }: ImageConversationProps) {
  if (loading) {
    return <LoadingView variant="analysis" />;
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
              <Text style={styles.featureBullet}>{"\u00b7"}</Text>
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
  errorContainer: {
    backgroundColor: colors.errorBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 115, 94, 0.25)',
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    fontFamily: fonts.body,
    color: colors.error,
    fontSize: 14,
  },
  card: {
    ...cardStyle,
    marginBottom: 12,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  analysisText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flex: 1,
    backgroundColor: colors.accentMuted,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(202, 155, 83, 0.25)',
  },
  badgeLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  badgeText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.textPrimary,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  featureBullet: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.accent,
    marginRight: 8,
    lineHeight: 22,
  },
  featureText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
