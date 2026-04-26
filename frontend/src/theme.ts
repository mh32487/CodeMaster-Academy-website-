/**
 * CodeMaster Academy theme - shared design tokens.
 */
export const colors = {
  primary: {
    blue: '#3B82F6',
    blueDark: '#2563EB',
    purple: '#8B5CF6',
    purpleDark: '#7C3AED',
  },
  bg: {
    main: '#F8FAFC',
    surface: '#FFFFFF',
    dark: '#0F172A',
    code: '#1E293B',
  },
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
    code: '#F8FAFC',
  },
  border: '#E2E8F0',
  divider: '#F1F5F9',
  status: {
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#0EA5E9',
  },
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  caption: 12,
  small: 14,
  body: 16,
  h3: 20,
  h2: 24,
  h1: 32,
  hero: 40,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  big: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
};
