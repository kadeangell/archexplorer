import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { CameraIcon, ImageIcon } from "phosphor-react-native";
import { useImageConversation } from "../src/hooks/useImageConversation";
import { ImageConversation, LoadingView } from "../src/components";
import { colors, fonts, cardStyle, primaryButtonStyle, primaryButtonDisabledStyle } from "../src/theme";

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
          <CameraIcon size={28} color={colors.accent} weight="light" />
          <Text style={styles.actionButtonText}>Take Photo</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={pickImage}>
          <ImageIcon size={28} color={colors.accent} weight="light" />
          <Text style={styles.actionButtonText}>Choose from Library</Text>
        </Pressable>
      </View>

      {imageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        </View>
      )}

      {loading ? (
        <LoadingView variant="analysis" />
      ) : (
        <Pressable
          style={[
            styles.analyzeButton,
            (!imageUri || loading) && styles.analyzeButtonDisabled,
          ]}
          onPress={analyzeImage}
          disabled={!imageUri || loading}
        >
          <Text style={styles.analyzeButtonText}>Analyze Architecture</Text>
        </Pressable>
      )}

      <ImageConversation result={result} loading={loading} error={error} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.textPrimary,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textTertiary,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    ...cardStyle,
    alignItems: "center",
    gap: 8,
  },
  actionButtonText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
  previewContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  previewImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  analyzeButton: {
    ...primaryButtonStyle,
    marginBottom: 16,
  },
  analyzeButtonDisabled: {
    ...primaryButtonDisabledStyle,
  },
  analyzeButtonText: {
    fontFamily: fonts.body,
    color: colors.textOnAccent,
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
