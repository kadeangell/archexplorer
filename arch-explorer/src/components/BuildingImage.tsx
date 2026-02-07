import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import { useState } from "react";

interface BuildingImageProps {
  imageUrl?: string;
  buildingName: string;
}

export function BuildingImage({ imageUrl, buildingName }: BuildingImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!imageUrl) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>No image available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator style={styles.loader} color="#6366f1" />}
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, error && styles.hidden]}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        accessibilityLabel={`Photo of ${buildingName}`}
      />
      {error && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Image failed to load</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  hidden: {
    display: "none",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  placeholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  placeholderText: {
    color: "#9ca3af",
    fontSize: 14,
  },
});
