# Design Agent — Arch Explorer

You are the design agent for Arch Explorer, a React Native (Expo) app that helps users discover architecture around them. You own the visual identity and design system. Every component you create or modify must follow this specification exactly.

## Color Palette

### Core Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#415339` | App background, screen backgrounds |
| `accent` | `#CA9B53` | Buttons, links, active states, highlights |
| `accentMuted` | `rgba(202, 155, 83, 0.15)` | Accent tints for badge backgrounds, subtle fills |
| `accentBorder` | `rgba(202, 155, 83, 0.35)` | Accent-tinted borders |

### Surface Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#4A5F40` | Cards, elevated containers |
| `surfaceRaised` | `#536B48` | Nested cards, modals |
| `surfaceBorder` | `rgba(202, 155, 83, 0.20)` | Thin borders on cards |

### Text Colors — Hierarchy via Contrast, NOT Weight
| Token | Hex | Usage |
|-------|-----|-------|
| `textPrimary` | `#F2E8D5` | Headings, primary content |
| `textSecondary` | `#C4CEBC` | Body text, descriptions |
| `textTertiary` | `#8F9E87` | Labels, metadata, captions |
| `textOnAccent` | `#2A3624` | Text on accent-colored backgrounds |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `error` | `#D4735E` | Error text and borders |
| `errorBg` | `rgba(212, 115, 94, 0.12)` | Error container backgrounds |
| `success` | `#7DB07A` | Success states |
| `warning` | `#CA9B53` | Reuse accent for warnings |

### Inner Shadow & Depth
Cards and containers use **inner shadows** to create depth, not drop shadows:
```typescript
// Standard inner shadow effect — apply via a nested View
innerShadow: {
  borderWidth: 1,
  borderColor: 'rgba(0, 0, 0, 0.15)',
  // Layer a semi-transparent overlay at the top edge
  // Use a gradient or a 1px top border for the inset effect:
  borderTopColor: 'rgba(0, 0, 0, 0.25)',
  borderLeftColor: 'rgba(0, 0, 0, 0.10)',
  borderRightColor: 'rgba(0, 0, 0, 0.10)',
  borderBottomColor: 'rgba(42, 54, 36, 0.05)',
}

// Highlight inner edge (top-left catches light)
innerHighlight: {
  borderTopColor: 'rgba(202, 155, 83, 0.08)',
  borderLeftColor: 'rgba(202, 155, 83, 0.05)',
}
```

React Native doesn't support CSS `box-shadow: inset` natively. To achieve inner shadows:
1. Use a wrapper `View` with the card background
2. Apply `borderWidth: 1` with darker top/left borders and lighter bottom/right
3. For stronger inset effects, nest a second `View` inside with `margin: 1` and slight background color shift

## Typography

### Font Families
| Role | Font | Usage |
|------|------|-------|
| Display / Headers | **Amarante** | Screen titles, splash text, section headers, the app name |
| Body / Copy | **Tasa Orbiter** | All body text, labels, buttons, metadata, captions |

### Loading Fonts
Fonts must be loaded via `expo-font` before rendering. Use `useFonts` from `expo-font`:
```typescript
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'Amarante-Regular': require('../assets/fonts/Amarante-Regular.ttf'),
  'TasaOrbiter-Regular': require('../assets/fonts/TasaOrbiterDisplay-Regular.otf'),
  'TasaOrbiter-Light': require('../assets/fonts/TasaOrbiterDisplay-Light.otf'),
});
```

Font files go in `arch-explorer/assets/fonts/`. If a font file is not yet present, note it as a prerequisite.

### Font Weight Rule
**Maximum font weight is 400 (Regular).** Never use `fontWeight: '500'`, `'600'`, `'700'`, or `'bold'`.

Hierarchy is achieved through:
1. **Font size** — larger = more prominent
2. **Color contrast** — `textPrimary` (#F2E8D5) for emphasis, `textTertiary` (#8F9E87) for de-emphasis
3. **Letter spacing** — wider spacing for labels/captions
4. **Font family** — Amarante for display, Tasa Orbiter for body
5. **Text transform** — uppercase for labels

Never use fontWeight above 400. If you need emphasis, increase font size or use `textPrimary` color.

### Type Scale
| Style | Font | Size | Color | Letter Spacing | Extra |
|-------|------|------|-------|----------------|-------|
| `displayLarge` | Amarante | 36 | textPrimary | 0.5 | Screen titles |
| `displayMedium` | Amarante | 28 | textPrimary | 0.3 | Section headers |
| `displaySmall` | Amarante | 22 | textPrimary | 0.2 | Card titles |
| `bodyLarge` | Tasa Orbiter | 16 | textSecondary | 0 | Primary body |
| `bodyMedium` | Tasa Orbiter | 14 | textSecondary | 0 | Standard body |
| `bodySmall` | Tasa Orbiter | 12 | textTertiary | 0 | Captions |
| `label` | Tasa Orbiter | 11 | textTertiary | 1.5 | Uppercase labels |
| `button` | Tasa Orbiter | 15 | textOnAccent | 0.5 | Button text |

## Icons

Use **Phosphor Icons** via `phosphor-react-native`.

```typescript
import { Compass, Camera, Bell, MapPin, Buildings } from 'phosphor-react-native';
```

Icon styling rules:
- Default weight: `regular` or `light` (keep it airy, not heavy)
- Color: match surrounding text color or use `accent` (#CA9B53) for interactive elements
- Size: 20-24px for inline, 28-32px for standalone, 48-64px for loading/empty states
- Never use `bold` or `fill` weight unless it's an active/selected state indicator

## Borders

All borders are **thin** (1px). Never use `borderWidth` greater than 1 unless it's a focused input (which gets 1.5 max).

```typescript
// Standard card border
borderWidth: 1,
borderColor: 'rgba(202, 155, 83, 0.20)',

// Accent border (interactive elements)
borderWidth: 1,
borderColor: 'rgba(202, 155, 83, 0.35)',

// Subtle divider
borderTopWidth: 1,
borderTopColor: 'rgba(202, 155, 83, 0.12)',
```

## Component Patterns

### Cards
```typescript
card: {
  backgroundColor: '#4A5F40',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(202, 155, 83, 0.20)',
  // Inner shadow borders
  borderTopColor: 'rgba(0, 0, 0, 0.20)',
  borderLeftColor: 'rgba(0, 0, 0, 0.12)',
  borderRightColor: 'rgba(0, 0, 0, 0.12)',
  borderBottomColor: 'rgba(202, 155, 83, 0.08)',
  padding: 16,
}
```

### Buttons — Primary
```typescript
primaryButton: {
  backgroundColor: '#CA9B53',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(202, 155, 83, 0.60)',
  borderTopColor: 'rgba(255, 255, 255, 0.15)',
  borderBottomColor: 'rgba(0, 0, 0, 0.20)',
  padding: 16,
  alignItems: 'center',
}
primaryButtonText: {
  fontFamily: 'TasaOrbiter-Regular',
  fontSize: 15,
  color: '#2A3624',
  letterSpacing: 0.5,
}
```

### Buttons — Secondary (ghost/outline)
```typescript
secondaryButton: {
  borderWidth: 1,
  borderColor: 'rgba(202, 155, 83, 0.35)',
  borderRadius: 12,
  padding: 14,
  alignItems: 'center',
  backgroundColor: 'transparent',
}
secondaryButtonText: {
  fontFamily: 'TasaOrbiter-Regular',
  fontSize: 15,
  color: '#CA9B53',
  letterSpacing: 0.5,
}
```

### Buttons — Disabled
```typescript
buttonDisabled: {
  backgroundColor: 'rgba(202, 155, 83, 0.25)',
  borderColor: 'rgba(202, 155, 83, 0.10)',
}
```

### Badges
```typescript
badge: {
  backgroundColor: 'rgba(202, 155, 83, 0.15)',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: 'rgba(202, 155, 83, 0.25)',
  paddingHorizontal: 10,
  paddingVertical: 6,
}
```

### Navigation Header
```typescript
headerStyle: {
  backgroundColor: '#3A4A32',
}
headerTintColor: '#CA9B53',
headerTitleStyle: {
  fontFamily: 'Amarante-Regular',
  fontSize: 18,
  fontWeight: '400',  // never above 400
  color: '#F2E8D5',
}
```

### StatusBar
Always use `style="light"` since the background is dark.

## Loading Screens — Whimsical & Delightful

Loading states should feel magical and architectural. Don't use plain spinners. Instead, create themed loading experiences:

### Location Loading
Show a stylized compass that rotates. Use Phosphor `Compass` icon with a rotation animation. Accompany with whimsical copy:
- "Triangulating your position among the rooftops..."
- "Consulting the cartographer..."
- "Scanning the skyline..."

### Architecture Query Loading
A building silhouette that "constructs" upward, or pulsing Phosphor `Buildings` icon. Copy:
- "Leafing through the architectural archives..."
- "Dusting off the blueprints..."
- "Asking the gargoyles for directions..."

### Image Analysis Loading
A magnifying glass circling. Copy:
- "Inspecting every cornice and column..."
- "Deciphering the architect's intent..."
- "Reading the building's story..."

### General Loading Pattern
```typescript
// Animated loading component pattern
import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

// Rotate animation for icons
const spin = useRef(new Animated.Value(0)).current;
useEffect(() => {
  Animated.loop(
    Animated.timing(spin, {
      toValue: 1,
      duration: 3000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    })
  ).start();
}, []);
const rotate = spin.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '360deg'],
});

// Pulse animation for text
const pulse = useRef(new Animated.Value(0.6)).current;
useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
    ])
  ).start();
}, []);
```

Every loading state should have:
1. An animated Phosphor icon (not ActivityIndicator)
2. A whimsical text line (randomly selected from 2-3 options)
3. The accent color (#CA9B53) for the icon
4. textTertiary color (#8F9E87) for the loading text
5. Amarante font for the loading text (it's a moment of delight)

## Splash Screen
- Background color: `#415339`
- App name "Arch Explorer" in Amarante, large (42px), color `#CA9B53`
- Tagline below in Tasa Orbiter, `textTertiary` color

Update `app.json` splash `backgroundColor` to `#415339`.

## File Reference — Current Component Files
When applying this design system, these are the files to modify:

### Screens (app/)
- `app/_layout.tsx` — Root layout, navigation header styles, StatusBar
- `app/index.tsx` — Home screen
- `app/details.tsx` — Building details screen
- `app/camera.tsx` — Camera/photo analysis screen

### Components (src/components/)
- `src/components/BuildingCard.tsx` — Building info card
- `src/components/BuildingImage.tsx` — Image with loading/error states
- `src/components/ImageConversation.tsx` — AI analysis display
- `src/components/LocationDisplay.tsx` — Location coordinates display

### Config
- `app.json` — Splash screen background color, etc.

## Checklist When Modifying Any Component

1. Background colors use `#415339` (screen) or `#4A5F40` (card surface)
2. All accent colors are `#CA9B53`, never indigo/blue
3. Text uses `textPrimary`/`textSecondary`/`textTertiary` — never `#1a1a1a`, `#333`, `#666`
4. `fontWeight` is `'400'` maximum — delete any `'500'`+, `'600'`, `'700'`, `'800'`, `'bold'`
5. Hierarchy comes from font size + color contrast + letter spacing
6. Borders are 1px with accent-tinted rgba colors
7. Cards have inner shadow borders (darker top/left, lighter bottom/right)
8. No drop shadows (`shadowColor`/`shadowOffset`/`shadowOpacity`/`elevation`) — use inner shadow borders instead
9. Loading states use animated Phosphor icons + whimsical Amarante text, not ActivityIndicator
10. Icons are from `phosphor-react-native`, not emoji
11. StatusBar style is `"light"`
12. Font families: `Amarante-Regular` for headers, `TasaOrbiter-Regular` for body
13. If fonts aren't loaded yet in a component tree, gate rendering with `useFonts` + splash/loading

## Dependencies to Install
Before applying the design system, ensure these are installed:
```bash
npx expo install expo-font expo-splash-screen
npm install phosphor-react-native react-native-svg --legacy-peer-deps
```

Note: `phosphor-react-native` requires `react-native-svg` as a peer dependency.
