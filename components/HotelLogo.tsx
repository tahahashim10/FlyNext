'use client';

import React, { useMemo } from 'react';

interface HotelLogoProps {
  logo: string | null | undefined;
  name: string;
  className?: string;
}

export default function HotelLogo({ logo, name, className = "w-full h-64" }: HotelLogoProps) {
  // Generate a sophisticated logo if none exists
  const generatedLogo = useMemo(() => {
    if (logo) return null; // No need to generate

    // Extract the first one or two letters, preferring words with more meaning
    const words = name.split(/\s+/);
    const initial = words.length > 1 
      ? words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase()
      : name.charAt(0).toUpperCase() + (name.length > 1 ? name.charAt(1).toLowerCase() : '');

    // Sophisticated color palette with gradient
    const gradients = [
      { 
        start: '#667eea', 
        end: '#764ba2', 
        text: 'white',
        shadow: 'rgba(102, 126, 234, 0.3)'
      },
      { 
        start: '#00b4db', 
        end: '#0083b0', 
        text: 'white',
        shadow: 'rgba(0, 180, 219, 0.3)'
      },
      { 
        start: '#ff6a00', 
        end: '#ee0979', 
        text: 'white',
        shadow: 'rgba(255, 106, 0, 0.3)'
      },
      { 
        start: '#42e695', 
        end: '#3bb2b8', 
        text: 'white',
        shadow: 'rgba(66, 230, 149, 0.3)'
      }
    ];

    // Use deterministic color selection
    const colorIndex = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % gradients.length;
    const { start, end, text, shadow } = gradients[colorIndex];

    // Create an advanced SVG logo with modern design elements
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet">
        <!-- Gradient Background -->
        <defs>
          <linearGradient id="hotelGradient-${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${start}"/>
            <stop offset="100%" stop-color="${end}"/>
          </linearGradient>
          
          <!-- Subtle Shadow Filter -->
          <filter id="shadowFilter-${colorIndex}" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
            <feOffset dx="0" dy="10" result="offsetblur"/>
            <feFlood flood-color="${shadow}"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Background Rectangle with Gradient and Soft Corners -->
        <rect 
          width="500" 
          height="500" 
          rx="50" 
          ry="50" 
          fill="url(#hotelGradient-${colorIndex})"
          filter="url(#shadowFilter-${colorIndex})"
        />

        <!-- Stylized Text -->
        <text 
          x="50%" 
          y="50%" 
          text-anchor="middle" 
          dy=".35em" 
          fill="${text}" 
          font-family="'Helvetica Neue', Arial, sans-serif" 
          font-size="250" 
          font-weight="700"
          letter-spacing="-15"
          filter="url(#shadowFilter-${colorIndex})"
        >
          ${initial}
        </text>
      </svg>
    `;
  }, [logo, name]);

  // Display the actual logo if it exists
  if (logo) {
    return (
      <div className={`${className} rounded-lg overflow-hidden shadow-md`}>
        <img
          src={logo}
          alt={`${name} logo`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  
  // Display the generated logo if no logo exists
  return (
    <div className={`${className} rounded-lg overflow-hidden shadow-md flex items-center justify-center`} style={{ backgroundColor: 'transparent' }}>
      {generatedLogo ? (
        <div dangerouslySetInnerHTML={{ __html: generatedLogo }} className="w-full h-full" />
      ) : (
        <span className="text-lg text-muted">No logo available</span>
      )}
    </div>
  );
}