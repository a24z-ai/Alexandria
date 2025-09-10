import { defaultTheme } from 'themed-markdown';
import type { Theme } from 'themed-markdown';

// Preview theme with warmer, richer colors (light mode)
export const previewTheme: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    
    // Base colors
    text: '#361B1B',           // Dark Brown/Near Black
    background: '#F6F2EA',     // Parchment/Off-White
    primary: '#0D3B4A',        // Deep Teal/Blue
    secondary: '#EFCF83',      // Gold/Ochre
    accent: '#AA5725',         // Terracotta/Red Ocher
    highlight: '#F6DEB9',      // Lighter Gold/Brightened Ochre
    muted: '#8A837A',          // Muted Gray-Brown
    
    // Status colors
    success: '#4CAF50',        // Standard green
    warning: '#FFC107',        // Standard amber
    error: '#F44336',          // Standard red
    info: '#2196F3',           // Standard blue
    
    // Additional semantic colors
    border: '#C7B9A3',         // Lighter muted tone for borders
    surface: '#FFFFFF',        // Pure white for cards
    backgroundSecondary: '#EDE9E0',  // Slightly darker parchment
    backgroundTertiary: '#DBCEB8',   // Even darker for section headers
    backgroundLight: '#FFFFFF',      // Pure white for clean contrast
    backgroundHover: '#E9E4DB',      // Subtle hover state
    textSecondary: '#5C4B4B',        // Slightly lighter text
    textTertiary: '#8A837A',         // Muted text (matches muted base)
    textMuted: '#B0A79A',            // Very light, subtle text
  },
};

// Preview theme for dark mode
export const previewThemeDark: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    
    // Base colors
    text: '#e5e5e5',
    background: '#252525',
    primary: '#d4d4d4',
    secondary: '#454545',
    accent: '#454545',
    highlight: '#454545',
    muted: '#454545',
    
    // Status colors
    error: '#dc2626',
    warning: '#d97706',
    success: '#059669',
    info: '#2563eb',
    
    // Additional semantic colors
    border: 'rgba(255, 255, 255, 0.1)',
    surface: '#343434',
    backgroundSecondary: '#343434',
    backgroundTertiary: '#454545',
    backgroundLight: '#454545',
    backgroundHover: '#454545',
    textSecondary: '#b5b5b5',
    textTertiary: '#b5b5b5',
    textMuted: '#b5b5b5',
  },
};

// Alexandria theme that extends the default with our color system (light mode)
// Soft, non-harsh light theme
export const alexandriaTheme: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    
    // Base colors - soft light theme
    text: '#2d2d2d',           // Dark gray, not black
    background: '#fafaf9',     // Soft off-white with warmth
    primary: '#4a5fc1',        // Soft blue
    secondary: '#f3f3f2',      // Light gray
    accent: '#f3f3f2',         // Light accent
    highlight: 'rgba(74, 95, 193, 0.1)', // Light blue highlight
    muted: '#e8e8e7',          // Muted background

    // Status colors
    success: '#10b981',        // Green
    warning: '#f59e0b',        // Amber
    error: '#ef4444',          // Red
    info: '#3b82f6',           // Blue

    // Additional semantic colors
    border: '#e5e5e4',         // Soft border
    backgroundSecondary: '#f5f5f4',  // Slightly darker than background
    backgroundTertiary: '#ededec',   // Even darker
    backgroundLight: '#ffffff',      // Pure white for contrast
    backgroundHover: '#f0f0ef',      // Hover state
    surface: '#ffffff',        // White surface
    textSecondary: '#71717a',  // Secondary text
    textTertiary: '#a1a1aa',   // Tertiary text
    textMuted: '#a1a1aa',      // Muted text
  },
};

// Alexandria theme for dark mode
export const alexandriaThemeDark: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    
    // Dark mode colors
    text: '#e5e5e5',           // Softer white, less harsh on eyes
    background: '#252525',     // oklch(0.145 0 0)
    primary: '#d4d4d4',        // Softer white for primary
    secondary: '#454545',      // oklch(0.269 0 0)
    accent: '#454545',         // oklch(0.269 0 0)
    highlight: '#454545',      
    muted: '#454545',          // oklch(0.269 0 0)
    border: 'rgba(255, 255, 255, 0.1)',
    
    // Surface and background variations
    surface: '#343434',        // oklch(0.205 0 0)
    backgroundSecondary: '#343434',
    backgroundTertiary: '#454545',
    backgroundLight: '#454545',
    backgroundHover: '#454545',
    
    // Text variations
    textSecondary: '#b5b5b5',  // oklch(0.708 0 0)
    textTertiary: '#b5b5b5',
    textMuted: '#b5b5b5',
    
    // Semantic colors
    error: '#dc2626',          // dark red
    warning: '#d97706',        // dark amber
    success: '#059669',        // dark emerald
    info: '#2563eb',           // dark blue
  },
};