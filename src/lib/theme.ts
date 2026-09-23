import { useColorScheme } from 'react-native';

const light = {
  bg: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF0F4',
  border: '#E2E5EB',
  text: '#0F1729',
  textMuted: '#5B6478',
  primary: '#4F46E5',
  primaryText: '#FFFFFF',
  success: '#12805C',
  warning: '#B45309',
  danger: '#C62828',
  successBg: '#E3F5EE',
  warningBg: '#FDF1E1',
  dangerBg: '#FCE8E8',
  primaryBg: '#ECEBFD',
};

const dark: typeof light = {
  bg: '#0B0F19',
  surface: '#151B2B',
  surfaceAlt: '#1D2538',
  border: '#27304A',
  text: '#F1F3F9',
  textMuted: '#98A1B8',
  primary: '#8B85FF',
  primaryText: '#0B0F19',
  success: '#4ADE9B',
  warning: '#FBBF5B',
  danger: '#FF7A7A',
  successBg: '#10281F',
  warningBg: '#2E2311',
  dangerBg: '#2F1416',
  primaryBg: '#221F4A',
};

export type Palette = typeof light;

export function useTheme(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const radius = { sm: 8, md: 12, lg: 18 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
