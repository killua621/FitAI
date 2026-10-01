export const theme = {
  colors: {
    background: '#F4F0EB',
    surface: '#FFFCF8',
    ink: '#1D1815',
    muted: '#85766C',
    line: '#E7DDD4',
    dark: '#191411',
    darkSoft: '#251C17',
    brown: '#5A3929',
    brownLight: '#E9D9CC',
    orange: '#F4773E',
    orangeDeep: '#D85D2B',
    orangeSoft: '#FBE5D9',
    white: '#FFFFFF',
    sage: '#65785C',
  },
  spacing: { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 44 },
  radius: { sm: 12, md: 18, lg: 26, xl: 32, pill: 999 },
  type: { display: 56, title: 36, heading: 23, body: 16, caption: 13, small: 11 },
} as const;

export type Theme = typeof theme;
