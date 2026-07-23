// src/constants/theme.js
// Central design tokens. Keep every screen/component pulling colors and
// spacing from here so the app stays visually consistent and re-themeable.

export const palette = {
  black: "#0B0D10",
  charcoal: "#15181D",
  slate: "#1E2229",
  slateLight: "#2A2F38",
  border: "#2E333C",
  white: "#FFFFFF",
  offWhite: "#F5F6F8",
  gray: "#8A8F98",
  grayLight: "#B4B8C0",
  brand: "#4F6BFF",
  brandDark: "#3B52D9",
  success: "#2FBF71",
  danger: "#E5484D",
  warning: "#F5A623",
};

export const theme = {
  dark: {
    background: palette.black,
    surface: palette.charcoal,
    surfaceAlt: palette.slate,
    border: palette.border,
    textPrimary: palette.white,
    textSecondary: palette.grayLight,
    textMuted: palette.gray,
    accent: palette.brand,
    accentPressed: palette.brandDark,
    success: palette.success,
    danger: palette.danger,
    warning: palette.warning,
    tabBarBackground: palette.charcoal,
  },
  light: {
    background: palette.offWhite,
    surface: palette.white,
    surfaceAlt: "#EEF0F3",
    border: "#E1E4E9",
    textPrimary: "#14161A",
    textSecondary: "#4B4F58",
    textMuted: "#868B94",
    accent: palette.brand,
    accentPressed: palette.brandDark,
    success: palette.success,
    danger: palette.danger,
    warning: palette.warning,
    tabBarBackground: palette.white,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "700" },
  h2: { fontSize: 22, fontWeight: "700" },
  h3: { fontSize: 18, fontWeight: "600" },
  body: { fontSize: 15, fontWeight: "400" },
  bodyStrong: { fontSize: 15, fontWeight: "600" },
  caption: { fontSize: 13, fontWeight: "400" },
  tiny: { fontSize: 11, fontWeight: "500" },
};

export default theme;
