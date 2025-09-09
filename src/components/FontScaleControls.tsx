import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface FontScaleControlsProps {
  className?: string;
}

export function FontScaleControls({ className }: FontScaleControlsProps = {}) {
  const [fontScale, setFontScale] = useState<number>(1);

  useEffect(() => {
    const savedScale = localStorage.getItem('fontScale');
    if (savedScale) {
      const scale = parseFloat(savedScale);
      setFontScale(scale);
      // Apply scale to CSS custom property for immediate effect
      document.documentElement.style.setProperty('--font-scale', scale.toString());
    }
  }, []);

  const updateFontScale = (newScale: number) => {
    // Clamp between 0.75 and 1.5
    const clampedScale = Math.max(0.75, Math.min(1.5, newScale));
    setFontScale(clampedScale);
    localStorage.setItem('fontScale', clampedScale.toString());
    
    // Apply to CSS custom property
    document.documentElement.style.setProperty('--font-scale', clampedScale.toString());
    
    // Dispatch custom event so other components can listen
    window.dispatchEvent(new CustomEvent('fontScaleChange', { 
      detail: { fontScale: clampedScale } 
    }));
  };

  const decreaseFontSize = () => {
    updateFontScale(fontScale - 0.1);
  };

  const increaseFontSize = () => {
    updateFontScale(fontScale + 0.1);
  };

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={decreaseFontSize}
        disabled={fontScale <= 0.75}
        className="h-9 w-9"
        aria-label="Decrease font size"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-xs text-muted-foreground min-w-[2rem] text-center">
        {Math.round(fontScale * 100)}%
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={increaseFontSize}
        disabled={fontScale >= 1.5}
        className="h-9 w-9"
        aria-label="Increase font size"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}