export const colors = {
  bg0: '#060918',
  bg1: '#0D1330',
  bg2: '#1B1148',
  surface: 'rgba(255,255,255,0.06)',
  surfaceStrong: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.22)',
  text: '#F5F7FF',
  muted: '#8E96BB',
  accent: '#7C5CFF',
  accent2: '#22D3EE',
  success: '#34D399',
  danger: '#FB7185',
  warn: '#FBBF24',
  gold: '#FBBF24',
  silver: '#CBD5E1',
  bronze: '#FB923C',
};

export const gradients = {
  background: [colors.bg0, colors.bg1, colors.bg2],
  primary: ['#8B5CF6', '#4F7CFF'],
  success: ['#10B981', '#22D3EE'],
  ghost: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)'],
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

export const shadow = (color = '#000', opacity = 0.35, blur = 20, y = 10) => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: blur,
  shadowOffset: { width: 0, height: y },
  elevation: 10,
});

export const MAX_WIDTH = 380;
