import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { useImageConversation } from "../src/hooks/useImageConversation";
import { ImageConversation } from "../src/components/ImageConversation";

export default function CameraScreen() {
  const { imageUri, result, loading, error, pickImage, captureImage, analyzeImage } =
    useImageConversation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Architecture Analyzer</Text>
        <Text style={styles.subtitle}>
          Take or choose a photo to identify architectural styles
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={styles.actionButton} onPress={captureImage}>
          <Text style={styles.actionButtonIcon}>📷</Text>
          <Text style={styles.actionButtonText}>Take Photo</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={pickImage}>
          <Text style={styles.actionButtonIcon}>🖼️</Text>
          <Text style={styles.actionButtonText}>Choose from Library</Text>
        </Pressable>
      </View>

      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        </View>
      )}

      <Pressable
        style={[
          styles.analyzeButton,
          (!imageUri || loading) && styles.analyzeButtonDisabled,
        ]}
        onPress={analyzeImage}
        disabled={!imageUri || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.analyzeButtonText}>Analyze Architecture</Text>
        )}
      </Pressable>

      <ImageConversation result={result} loading={loading} error={error} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  actionButtonIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  previewContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  analyzeButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  analyzeButtonDisabled: {
    backgroundColor: "#c7c8f9",
  },
  analyzeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
