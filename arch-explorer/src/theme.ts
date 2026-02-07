/**
 * Arch Explorer Design System
 *
 * Colors, typography, and shared style primitives.
 * All font weights max out at 400. Hierarchy is achieved
 * through size, color contrast, letter-spacing, and font family.
 */

export const colors = {
  background: '#415339',
  accent: '#CA9B53',
  accentMuted: 'rgba(202, 155, 83, 0.15)',
  accentBorder: 'rgba(202, 155, 83, 0.35)',

  surface: '#4A5F40',
  surfaceRaised: '#536B48',
  surfaceBorder: 'rgba(202, 155, 83, 0.20)',

  textPrimary: '#F2E8D5',
  textSecondary: '#C4CEBC',
  textTertiary: '#8F9E87',
  textOnAccent: '#2A3624',

  error: '#D4735E',
  errorBg: 'rgba(212, 115, 94, 0.12)',
  success: '#7DB07A',

  headerBg: '#3A4A32',

  // Inner shadow helpers
  innerShadowTop: 'rgba(0, 0, 0, 0.20)',
  innerShadowSide: 'rgba(0, 0, 0, 0.12)',
  innerHighlightBottom: 'rgba(202, 155, 83, 0.08)',
} as const;

export const fonts = {
  heading: 'Amarante-Regular',
  body: 'TASAOrbiter-Regular',
} as const;

/** Reusable card style with thin border + inner shadow effect */
export const cardStyle = {
  backgroundColor: colors.surface,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.surfaceBorder,
  borderTopColor: colors.innerShadowTop,
  borderLeftColor: colors.innerShadowSide,
  borderRightColor: colors.innerShadowSide,
  borderBottomColor: colors.innerHighlightBottom,
  padding: 16,
} as const;

export const primaryButtonStyle = {
  backgroundColor: colors.accent,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(202, 155, 83, 0.60)',
  borderTopColor: 'rgba(255, 255, 255, 0.15)',
  borderBottomColor: 'rgba(0, 0, 0, 0.20)',
  padding: 16,
  alignItems: 'center' as const,
};

export const primaryButtonDisabledStyle = {
  backgroundColor: 'rgba(202, 155, 83, 0.25)',
  borderColor: 'rgba(202, 155, 83, 0.10)',
  borderTopColor: 'rgba(202, 155, 83, 0.10)',
  borderBottomColor: 'rgba(202, 155, 83, 0.10)',
};

export const secondaryButtonStyle = {
  borderWidth: 1,
  borderColor: colors.accentBorder,
  borderRadius: 12,
  padding: 14,
  alignItems: 'center' as const,
  backgroundColor: 'transparent',
};
