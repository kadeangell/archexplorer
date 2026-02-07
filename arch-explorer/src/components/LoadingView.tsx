import { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { CompassIcon, BuildingsIcon, MagnifyingGlassIcon, MapPinIcon } from 'phosphor-react-native';
import { colors, fonts } from '../theme';

type LoadingVariant = 'location' | 'architecture' | 'analysis' | 'general';

const messages: Record<LoadingVariant, string[]> = {
  location: [
    'Triangulating among the rooftops\u2026',
    'Consulting the cartographer\u2026',
    'Scanning the skyline\u2026',
  ],
  architecture: [
    'Leafing through the archives\u2026',
    'Dusting off the blueprints\u2026',
    'Asking the gargoyles for directions\u2026',
  ],
  analysis: [
    'Inspecting every cornice and column\u2026',
    'Deciphering the architect\u2019s intent\u2026',
    'Reading the building\u2019s story\u2026',
  ],
  general: [
    'Wandering the corridors\u2026',
    'Tracing the floorplan\u2026',
    'Admiring the fa\u00e7ade\u2026',
  ],
};

const IconForVariant = {
  location: CompassIcon,
  architecture: BuildingsIcon,
  analysis: MagnifyingGlassIcon,
  general: MapPinIcon,
};

interface LoadingViewProps {
  variant?: LoadingVariant;
  message?: string;
}

export function LoadingView({ variant = 'general', message }: LoadingViewProps) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.5)).current;
  const [msgIndex] = useState(() => Math.floor(Math.random() * messages[variant].length));

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const Icon = IconForVariant[variant];
  const displayMessage = message || messages[variant][msgIndex];

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Icon size={48} color={colors.accent} weight="light" />
      </Animated.View>
      <Animated.Text style={[styles.message, { opacity: pulse }]}>
        {displayMessage}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 20,
  },
  message: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
