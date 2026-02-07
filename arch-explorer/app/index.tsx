import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { BellIcon, BellSlashIcon, CameraIcon, CompassIcon } from "phosphor-react-native";
import { useLocation, useArchitectureAgent, useNotificationPermissions } from "../src/hooks";
import { LocationDisplay, LoadingView } from "../src/components";
import { colors, fonts, cardStyle, primaryButtonStyle, primaryButtonDisabledStyle, secondaryButtonStyle } from "../src/theme";

export default function HomeScreen() {
  const router = useRouter();
  const location = useLocation();
  const architecture = useArchitectureAgent();
  const notifications = useNotificationPermissions();

  const handleExplore = async () => {
    if (!location.coordinates) return;
    const result = await architecture.query(location.coordinates);
    if (result) {
      router.push({
        pathname: "/details",
        params: {
          buildings: JSON.stringify(result.buildings),
          summary: result.summary,
        },
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Arch Explorer</Text>
        <Text style={styles.subtitle}>
          Discover the architecture around you
        </Text>
      </View>

      <LocationDisplay
        coordinates={location.coordinates}
        loading={location.loading}
        error={location.error}
      />

      {architecture.loading ? (
        <LoadingView variant="architecture" />
      ) : (
        <Pressable
          style={[
            styles.exploreButton,
            (!location.coordinates || architecture.loading) &&
              styles.exploreButtonDisabled,
          ]}
          onPress={handleExplore}
          disabled={!location.coordinates || architecture.loading}
        >
          <CompassIcon size={20} color={colors.textOnAccent} weight="regular" />
          <Text style={styles.exploreButtonText}>
            Explore Nearby Architecture
          </Text>
        </Pressable>
      )}

      <Pressable
        style={styles.secondaryButton}
        onPress={notifications.toggleNotifications}
      >
        {notifications.notificationsEnabled ? (
          <BellSlashIcon size={18} color={colors.accent} weight="regular" />
        ) : (
          <BellIcon size={18} color={colors.accent} weight="regular" />
        )}
        <Text style={styles.secondaryButtonText}>
          {notifications.notificationsEnabled
            ? "Disable Notifications"
            : "Enable Notifications"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.push("/camera")}
      >
        <CameraIcon size={18} color={colors.accent} weight="regular" />
        <Text style={styles.secondaryButtonText}>Analyze Photo</Text>
      </Pressable>

      {architecture.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{architecture.error}</Text>
        </View>
      )}

      {!location.permissionGranted && !location.loading && (
        <View style={styles.permissionNotice}>
          <Text style={styles.permissionText}>
            Location access is needed to discover nearby architecture.
          </Text>
          <Pressable style={styles.retryButton} onPress={location.refresh}>
            <Text style={styles.retryButtonText}>Grant Access</Text>
          </Pressable>
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
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textTertiary,
  },
  exploreButton: {
    ...primaryButtonStyle,
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  exploreButtonDisabled: {
    ...primaryButtonDisabledStyle,
  },
  exploreButtonText: {
    fontFamily: fonts.body,
    color: colors.textOnAccent,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    ...secondaryButtonStyle,
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontFamily: fonts.body,
    color: colors.accent,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  errorContainer: {
    backgroundColor: colors.errorBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 115, 94, 0.25)',
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: fonts.body,
    color: colors.error,
    fontSize: 14,
  },
  permissionNotice: {
    ...cardStyle,
    alignItems: "center",
  },
  permissionText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    ...primaryButtonStyle,
    paddingHorizontal: 20,
    paddingVertical: 10,
    padding: undefined,
  },
  retryButtonText: {
    fontFamily: fonts.body,
    color: colors.textOnAccent,
    letterSpacing: 0.5,
  },
});
