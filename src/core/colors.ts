// Цветовая схема приложения
export const colors = {
  // Основной бирюзовый цвет
  primary: '#2dc2c6',
  
  // Оттенки бирюзового для hover эффектов
  primaryHover: '#25a8ac',
  primaryLight: '#4dd0d4',
  primaryDark: '#1fa8ac',
  
  // Нейтральные цвета
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Цвета для состояний
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

// CSS переменные для использования в стилях
export const cssColorVars = {
  '--color-primary': colors.primary,
  '--color-primary-hover': colors.primaryHover,
  '--color-primary-light': colors.primaryLight,
  '--color-primary-dark': colors.primaryDark,
} as const;

// Tailwind классы для основных цветов
export const tailwindColors = {
  primary: 'bg-[#2dc2c6]',
  primaryHover: 'hover:bg-[#25a8ac]',
  primaryBorder: 'border-[#2dc2c6]',
  primaryText: 'text-[#2dc2c6]',
} as const;
