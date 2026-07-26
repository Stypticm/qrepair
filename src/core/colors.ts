// Цветовая схема MiMiBU
export const colors = {
  primary: '#7ec8dc',
  primaryHover: '#6bb8cc',
  primaryLight: '#a8dce8',
  primaryDark: '#7aada3',

  white: '#ffffff',
  gray: {
    50: '#faf7f2',
    100: '#f3ede6',
    200: '#e8dfd0',
    300: '#d4c4b0',
    400: '#9a9088',
    500: '#7a6558',
    600: '#5c4a3a',
    700: '#4a3530',
    800: '#3d2b28',
    900: '#2a1f18',
  },

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

export const cssColorVars = {
  '--color-primary': colors.primary,
  '--color-primary-hover': colors.primaryHover,
  '--color-primary-light': colors.primaryLight,
  '--color-primary-dark': colors.primaryDark,
} as const;

export const tailwindColors = {
  primary: 'bg-teal-500',
  primaryHover: 'hover:bg-teal-600',
  primaryBorder: 'border-teal-500',
  primaryText: 'text-teal-500',
} as const;
