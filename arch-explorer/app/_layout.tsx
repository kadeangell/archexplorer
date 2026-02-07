import "../src/tasks/backgroundLocation";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { colors, fonts } from "../src/theme";

SplashScreen.preventAutoHideAsync();

function AppLoading() {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={loadingStyles.container}>
      <Text style={loadingStyles.title}>Arch Explorer</Text>
      <Animated.Text style={[loadingStyles.subtitle, { opacity: pulse }]}>
        Discovering the world around you...
      </Animated.Text>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  title: {
    fontSize: 42,
    color: colors.accent,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textTertiary,
    letterSpacing: 0.3,
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Amarante-Regular": require("../assets/fonts/Amarante-Regular.ttf"),
    "TASAOrbiter-Regular": require("../assets/fonts/TASAOrbiter-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.headerBg },
          headerTintColor: colors.accent,
          headerTitleStyle: {
            fontFamily: fonts.heading,
            fontSize: 18,
            fontWeight: "400",
            color: colors.textPrimary,
          },
          contentStyle: { backgroundColor: colors.background },
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
        <Stack.Screen
          name="map"
          options={{ title: "Explore Map" }}
        />
      </Stack>
    </>
  );
}
