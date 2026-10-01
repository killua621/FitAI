export const theme = {
  colors: {
    background: '#100D0B',
    surface: '#1C1714',
    ink: '#F7F1EC',
    muted: '#B5A69B',
    line: '#392D26',
    dark: '#090706',
    darkSoft: '#211914',
    brown: '#DEA17F',
    brownSurface: '#5B3927',
    brownLight: '#38271F',
    orange: '#F4773E',
    orangeDeep: '#FF9464',
    orangeSoft: '#3A241B',
    white: '#FFFFFF',
    sage: '#A8B393',
  },
  spacing: { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 44 },
  radius: { sm: 12, md: 18, lg: 26, xl: 32, pill: 999 },
  type: { display: 56, title: 36, heading: 23, body: 16, caption: 13, small: 11 },
} as const;

export type Theme = typeof theme;
