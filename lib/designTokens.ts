/**
 * Design tokens: all spacing and radius divisible by 4 for consistent UI.
 * Icon-to-text gap: 12px, between rows: 16px.
 */
export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,   // e.g. icon to text
  lg: 16,   // e.g. between rows
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
  "5xl": 40,
  "6xl": 48,
} as const;

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,  // cards
  "3xl": 24,  // large cards
} as const;
