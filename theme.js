export const colors = {
  bg: '#08090E',
  surface: '#12141D',
  surfaceHi: '#1A1D29',
  border: '#232637',
  borderHi: '#363A52',
  text: '#F3F4F8',
  muted: '#7E8399',
  accent: '#C8F533', // lima
  onAccent: '#0A0C06',
  blue: '#5B8CFF',
  success: '#3DE08C',
  danger: '#FF5470',
  warn: '#FFC53D',
  gold: '#FFC53D',
  silver: '#C9D1E0',
  bronze: '#F59A5B',
};

// Tipografías cargadas con expo-google-fonts (ver App.js)
export const fonts = {
  display: 'Sora_800ExtraBold',
  heading: 'Sora_700Bold',
  body: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

export const shadow = (color = '#000', opacity = 0.35, blur = 20, y = 10) => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: blur,
  shadowOffset: { width: 0, height: y },
  elevation: 10,
});

export const MAX_WIDTH = 400;
