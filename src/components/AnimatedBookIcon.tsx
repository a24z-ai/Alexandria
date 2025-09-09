import { useState, useEffect } from 'react';

interface AnimatedBookIconProps {
  className?: string;
  onClick?: () => void;
  size?: number;
}

export function AnimatedBookIcon({ className = '', onClick, size = 24 }: AnimatedBookIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Book opens when component mounts (page loads)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    // Start closing animation
    setIsClosing(true);
    setIsOpen(false);
    
    // Navigate after animation completes
    setTimeout(() => {
      if (onClick) onClick();
    }, 1000);
  };

  return (
    <button
      className={`cursor-pointer transition-transform hover:scale-110 ${className}`}
      onClick={handleClick}
      title="Back to repositories"
      aria-label="Back to repositories"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Book Open State - Lucide book-open icon */}
        <g
          className="transition-all duration-1000 ease-in-out"
          style={{
            opacity: isOpen && !isClosing ? 1 : 0,
            transform: isOpen && !isClosing ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-10deg)',
          }}
        >
          {/* Left page */}
          <path
            d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Right page */}
          <path
            d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Text lines on left */}
          <path d="M4 7h4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <path d="M4 10h3" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <path d="M4 13h4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          
          {/* Text lines on right */}
          <path d="M16 7h4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <path d="M16 10h3" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <path d="M16 13h4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </g>

        {/* Book Closed State - Lucide book icon */}
        <g
          className="transition-all duration-1000 ease-in-out"
          style={{
            opacity: !isOpen || isClosing ? 1 : 0,
            transform: !isOpen || isClosing ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(10deg)',
          }}
        >
          {/* Book outline */}
          <path
            d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </button>
  );
}