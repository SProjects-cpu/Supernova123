import { useState, useEffect } from 'react';
import { AnimatedGalaxyBackground } from './AnimatedGalaxyBackground';

interface SplineIframeGalaxyProps {
  className?: string;
}

export function SplineIframeGalaxy({ className = "" }: SplineIframeGalaxyProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    console.log('Spline iframe loaded successfully');
  };

  const handleError = () => {
    setHasError(true);
    console.log('Spline iframe failed to load');
  };

  // Use animated background for mobile or if there's an error
  if (hasError || isMobile) {
    return <AnimatedGalaxyBackground className={className} />;
  }

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Show animated background while loading */}
      {!isLoaded && <AnimatedGalaxyBackground />}
      
      {/* Spline iframe - trying multiple URLs */}
      <iframe
        src="https://app.spline.design/community/file/5ee9620e-2322-4dbd-a48c-9b8feb0f792f"
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
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-navy/20 to-space-navy/40 pointer-events-none" />
    </div>
  );
}
