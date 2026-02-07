import "../src/tasks/backgroundLocation";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#f8f9fa" },
          headerTintColor: "#1a1a1a",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Arch Explorer" }}
        />
        <Stack.Screen
          name="details"
          options={{ title: "Architectural Details" }}
        />
        <Stack.Screen
          name="camera"
          options={{ title: "Architecture Analyzer" }}
        />
      </Stack>
    </>
  );
}
