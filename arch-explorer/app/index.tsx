import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useLocation, useArchitectureAgent, useNotificationPermissions } from "../src/hooks";
import { LocationDisplay } from "../src/components";

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

      <Pressable
        style={[
          styles.exploreButton,
          (!location.coordinates || architecture.loading) &&
            styles.exploreButtonDisabled,
        ]}
        onPress={handleExplore}
        disabled={!location.coordinates || architecture.loading}
      >
        {architecture.loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.exploreButtonText}>
            Explore Nearby Architecture
          </Text>
        )}
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={notifications.toggleNotifications}
      >
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
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  exploreButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  exploreButtonDisabled: {
    backgroundColor: "#c7c8f9",
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: "#6366f1",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#6366f1",
    fontSize: 15,
    fontWeight: "700",
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
  },
  permissionNotice: {
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  permissionText: {
    fontSize: 14,
    color: "#92400e",
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#f59e0b",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
