import { useState } from 'react';
import { AnimatedGalaxyBackground } from './AnimatedGalaxyBackground';

interface SplineIframeBackgroundProps {
  className?: string;
}

export function SplineIframeBackground({ className = "" }: SplineIframeBackgroundProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    console.log('Spline iframe loaded successfully');
  };

  const handleError = () => {
    setHasError(true);
    console.log('Spline iframe failed to load');
  };

  // If there's an error, show the animated galaxy background
  if (hasError) {
    return <AnimatedGalaxyBackground className={className} />;
  }

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Show animated background while loading */}
      {!isLoaded && <AnimatedGalaxyBackground />}
      
      {/* Spline iframe */}
      <iframe
        src="https://my.spline.design/galaxycopy-5ee9620e2322"
        className={`w-full h-full border-0 transition-opacity duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        title="3D Galaxy Background"
        style={{
          background: 'transparent',
          pointerEvents: 'none', // Prevent interaction with the 3D scene
        }}
      />
      
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-navy/10 to-space-navy/30 pointer-events-none" />
    </div>
  );
}
