import { View, Text, StyleSheet } from "react-native";
import { BuildingImage } from "./BuildingImage";
import type { ArchitecturalDetail } from "../types";
import { colors, fonts, cardStyle } from "../theme";

interface BuildingCardProps {
  building: ArchitecturalDetail;
}

export function BuildingCard({ building }: BuildingCardProps) {
  return (
    <View style={styles.card}>
      {building.imageUrl && (
        <BuildingImage imageUrl={building.imageUrl} buildingName={building.name} />
      )}
      <Text style={styles.name}>{building.name}</Text>
      <Text style={styles.style}>{building.style}</Text>
      <Text style={styles.meta}>
        {building.yearBuilt} · {building.architect}
      </Text>
      <Text style={styles.address}>{building.address}</Text>
      <Text style={styles.description}>{building.description}</Text>
      {building.notableFeatures.length > 0 && (
        <View style={styles.features}>
          <Text style={styles.featuresLabel}>Notable Features</Text>
          {building.notableFeatures.map((feature, i) => (
            <Text key={i} style={styles.feature}>
              · {feature}
            </Text>
          ))}
        </View>
      )}
      {building.historicalSignificance ? (
        <Text style={styles.significance}>
          {building.historicalSignificance}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyle,
    marginBottom: 12,
  },
  name: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.textPrimary,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  style: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.accent,
    marginBottom: 4,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  address: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 8,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  features: {
    marginBottom: 8,
  },
  featuresLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  feature: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
    lineHeight: 20,
  },
  significance: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontStyle: "italic",
    color: colors.textTertiary,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 8,
  },
});
