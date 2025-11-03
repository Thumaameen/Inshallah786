import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Custom colors with better contrast and visibility
export const colors = {
  primary: {
    DEFAULT: '#1a73e8',
    dark: '#1557b0',
    light: '#4285f4',
    100: '#e8f0fe',
    200: '#c6dafc',
    300: '#9dc3fa',
    400: '#74a9f8',
    500: '#4285f4',
    600: '#1a73e8',
    700: '#1557b0',
    800: '#0d3c78',
    900: '#062249'
  },
  secondary: {
    DEFAULT: '#202124',
    dark: '#0f1012',
    light: '#3c4043',
    100: '#f8f9fa',
    200: '#e8eaed',
    300: '#dadce0',
    400: '#bdc1c6',
    500: '#9aa0a6',
    600: '#80868b',
    700: '#5f6368',
    800: '#3c4043',
    900: '#202124'
  },
  success: {
    DEFAULT: '#0f9d58',
    dark: '#0b8043',
    light: '#34a853',
    100: '#e6f4ea',
    200: '#ceead6',
    300: '#a8dab5',
    400: '#82c793',
    500: '#34a853',
    600: '#0f9d58',
    700: '#0b8043',
    800: '#07582e',
    900: '#043919'
  },
  warning: {
    DEFAULT: '#f9ab00',
    dark: '#f29900',
    light: '#fbbc04',
    100: '#fef7e0',
    200: '#feefc3',
    300: '#fde293',
    400: '#fdd663',
    500: '#fbbc04',
    600: '#f9ab00',
    700: '#f29900',
    800: '#ea8600',
    900: '#e37400'
  },
  error: {
    DEFAULT: '#d93025',
    dark: '#a50e0e',
    light: '#ea4335',
    100: '#fce8e6',
    200: '#fad2cc',
    300: '#f6aea6',
    400: '#f28b82',
    500: '#ea4335',
    600: '#d93025',
    700: '#a50e0e',
    800: '#870000',
    900: '#690000'
  },
  background: {
    DEFAULT: '#ffffff',
    dark: '#202124',
    light: '#ffffff',
    paper: '#ffffff',
    hover: '#f8f9fa'
  },
  text: {
    primary: '#202124',
    secondary: '#5f6368',
    disabled: '#80868b',
    hint: '#9aa0a6',
    white: '#ffffff',
    inverse: '#ffffff'
  }
};

// Updated font configuration for better readability
export const fonts = {
  sans: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'Arial',
    'sans-serif'
  ].join(','),
  mono: [
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace'
  ].join(','),
  heading: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif'
  ].join(',')
};

// Font sizes optimized for readability
export const fontSizes = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
};

// Spacing scale
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// Shadows optimized for depth perception
export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 6px 10px -1px rgb(0 0 0 / 0.1), 0 2px 6px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

// Mobile-first breakpoints
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Animation durations
export const animation = {
  fastest: '100ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slowest: '400ms',
};

// Z-index scale
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  modal: '999',
  tooltip: '1000',
  max: '9999',
};

// Utility function to merge class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Theme configuration for light and dark modes
export const theme = {
  light: {
    colors: {
      ...colors,
      background: {
        ...colors.background,
        DEFAULT: '#ffffff',
        paper: '#f8f9fa',
      },
      text: {
        ...colors.text,
        primary: '#202124',
        secondary: '#5f6368',
      },
    },
  },
  dark: {
    colors: {
      ...colors,
      background: {
        ...colors.background,
        DEFAULT: '#202124',
        paper: '#303134',
      },
      text: {
        ...colors.text,
        primary: '#ffffff',
        secondary: '#e8eaed',
      },
    },
  },
};

export default {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  animation,
  zIndex,
  theme,
};