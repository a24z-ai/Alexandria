import { defaultTheme } from 'themed-markdown';
import type { Theme } from 'themed-markdown';

// Preview theme with warmer, richer colors
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
    
    // Dark mode colors (keeping existing dark theme for now)
    modes: {
      dark: {
        text: '#e5e5e5',
        background: '#252525',
        primary: '#d4d4d4',
        secondary: '#454545',
        accent: '#454545',
        muted: '#454545',
        border: 'rgba(255, 255, 255, 0.1)',
        surface: '#343434',
        backgroundSecondary: '#343434',
        backgroundTertiary: '#454545',
        backgroundLight: '#454545',
        backgroundHover: '#454545',
        textSecondary: '#b5b5b5',
        textTertiary: '#b5b5b5',
        textMuted: '#b5b5b5',
        error: '#dc2626',
        warning: '#d97706',
        success: '#059669',
        info: '#2563eb',
      },
    },
  },
};

// Alexandria theme that extends the default with our color system
// Using actual hex colors for Mermaid diagram compatibility
export const alexandriaTheme: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    
    // Light mode colors - converted from OKLCH to hex
    text: '#252525',           // oklch(0.145 0 0)
    background: '#faf9f7',     // oklch(0.98 0.005 45) - warm off-white
    primary: '#343434',        // oklch(0.205 0 0)
    secondary: '#f7f7f7',      // oklch(0.97 0 0)
    accent: '#f7f7f7',         // oklch(0.97 0 0)
    muted: '#f7f7f7',          // oklch(0.97 0 0)
    border: '#ebebeb',         // oklch(0.922 0 0)
    
    // Surface and background variations
    surface: '#faf9f7',        // Same as background
    backgroundSecondary: '#faf9f7',
    backgroundTertiary: '#f7f7f7',
    backgroundLight: '#f7f7f7',
    backgroundHover: '#f7f7f7',
    
    // Text variations
    textSecondary: '#8e8e8e',  // oklch(0.556 0 0)
    textTertiary: '#8e8e8e',
    textMuted: '#8e8e8e',
    
    // Semantic colors
    error: '#ef4444',          // oklch(0.577 0.245 27.325) - red
    warning: '#f59e0b',        // amber
    success: '#10b981',        // emerald
    info: '#3b82f6',           // blue
    
    // Dark mode colors
    modes: {
      dark: {
        text: '#e5e5e5',       // Softer white, less harsh on eyes
        background: '#252525',  // oklch(0.145 0 0)
        primary: '#d4d4d4',     // Softer white for primary
        secondary: '#454545',   // oklch(0.269 0 0)
        accent: '#454545',      // oklch(0.269 0 0)
        muted: '#454545',       // oklch(0.269 0 0)
        border: 'rgba(255, 255, 255, 0.1)',
        surface: '#343434',     // oklch(0.205 0 0)
        backgroundSecondary: '#343434',
        backgroundTertiary: '#454545',
        backgroundLight: '#454545',
        backgroundHover: '#454545',
        textSecondary: '#b5b5b5', // oklch(0.708 0 0)
        textTertiary: '#b5b5b5',
        textMuted: '#b5b5b5',
        error: '#dc2626',       // dark red
        warning: '#d97706',     // dark amber
        success: '#059669',     // dark emerald
        info: '#2563eb',        // dark blue
      },
    },
  },
};