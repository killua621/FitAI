export const theme = {
  colors: {
    background: '#100D13',
    surface: '#19121F',
    surfaceRaised: '#24182F',
    ink: '#FAF7FC',
    muted: '#AA9EAE',
    line: '#402A53',
    dark: '#09070B',
    darkSoft: '#201824',
    purple: '#9D4DFF',
    purpleMuted: '#D5ACFF',
    purpleSurface: '#55228A',
    purpleSoft: '#35164F',
    orange: '#FF783F',
    orangeDeep: '#FF9B69',
    orangeSoft: '#3C211B',
    white: '#FFFFFF',
  },
  spacing: { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 44 },
  radius: { sm: 12, md: 18, lg: 26, xl: 32, pill: 999 },
  type: { display: 56, title: 36, heading: 23, body: 16, caption: 13, small: 11 },
} as const;

export type Theme = typeof theme;
