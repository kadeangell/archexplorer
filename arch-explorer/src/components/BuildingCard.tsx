import { View, Text, StyleSheet } from "react-native";
import { BuildingImage } from "./BuildingImage";
import type { ArchitecturalDetail } from "../types";

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
          <Text style={styles.featuresLabel}>Notable Features:</Text>
          {building.notableFeatures.map((feature, i) => (
            <Text key={i} style={styles.feature}>
              • {feature}
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  style: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366f1",
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 8,
  },
  features: {
    marginBottom: 8,
  },
  featuresLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
  },
  feature: {
    fontSize: 13,
    color: "#555",
    marginLeft: 8,
    lineHeight: 20,
  },
  significance: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#666",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
});
