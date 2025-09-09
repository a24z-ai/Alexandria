import { defaultTheme } from 'themed-markdown';
import type { Theme } from 'themed-markdown';

// Alexandria theme that extends the default with our color system
export const alexandriaTheme: Theme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    
    // Base colors using your CSS variables
    text: 'var(--foreground)',
    background: 'var(--background)',
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    accent: 'var(--accent)',
    muted: 'var(--muted)',
    border: 'var(--border)',
    
    // Surface and background variations
    surface: 'var(--card)',
    backgroundSecondary: 'var(--card)',
    backgroundTertiary: 'var(--muted)',
    backgroundLight: 'var(--secondary)',
    backgroundHover: 'var(--accent)',
    
    // Text variations
    textSecondary: 'var(--muted-foreground)',
    textTertiary: 'var(--muted-foreground)',
    textMuted: 'var(--muted-foreground)',
    
    // Keep semantic colors from default but add our destructive color
    error: 'var(--destructive)',
    
    // Dark mode colors - these will automatically switch with your CSS variables
    modes: {
      dark: {
        text: 'var(--foreground)',
        background: 'var(--background)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        surface: 'var(--card)',
        backgroundSecondary: 'var(--card)',
        backgroundTertiary: 'var(--muted)',
        backgroundLight: 'var(--secondary)',
        backgroundHover: 'var(--accent)',
        textSecondary: 'var(--muted-foreground)',
        textTertiary: 'var(--muted-foreground)',
        textMuted: 'var(--muted-foreground)',
        error: 'var(--destructive)',
      },
    },
  },
};