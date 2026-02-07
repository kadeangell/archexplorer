import {
  View,
  Image,
  StyleSheet,
  Text,
} from "react-native";
import { useState } from "react";
import { ImageIcon } from "phosphor-react-native";
import { LoadingView } from "./LoadingView";
import { colors, fonts } from "../theme";

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
        <ImageIcon size={28} color={colors.textTertiary} weight="light" />
        <Text style={styles.placeholderText}>No image available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loaderOverlay}>
          <LoadingView variant="general" message="Loading image\u2026" />
        </View>
      )}
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
          <ImageIcon size={28} color={colors.textTertiary} weight="light" />
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
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  hidden: {
    display: "none",
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    justifyContent: "center",
  },
  placeholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  placeholderText: {
    fontFamily: fonts.body,
    color: colors.textTertiary,
    fontSize: 14,
  },
});
