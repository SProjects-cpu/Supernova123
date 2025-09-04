import { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { AnimatedGalaxyBackground } from './AnimatedGalaxyBackground';
import { SplineIframeGalaxy } from './SplineIframeGalaxy';

interface SplineGalaxyBackgroundProps {
  className?: string;
}

export function SplineGalaxyBackground({ className = "" }: SplineGalaxyBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [useIframe, setUseIframe] = useState(false);

  useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    // Detect low performance devices
    const checkPerformance = () => {
      // Check for low-end devices based on various factors
      const isLowEnd = (
        navigator.hardwareConcurrency <= 2 || // Low CPU cores
        (navigator as any).deviceMemory <= 2 || // Low RAM (if available)
        /android.*version\/[1-4]/.test(navigator.userAgent.toLowerCase()) // Old Android
      );
      setIsLowPerformance(isLowEnd);
    };

    checkMobile();
    checkPerformance();

    // Enhanced resize handling with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        checkMobile();
        // Force re-render of Spline scene on significant size changes
        if (Math.abs(window.innerWidth - (window as any).lastWidth) > 100) {
          setIsLoaded(false);
          setTimeout(() => setIsLoaded(true), 100);
        }
        (window as any).lastWidth = window.innerWidth;
      }, 250);
    };

    // Store initial width
    (window as any).lastWidth = window.innerWidth;

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    console.log('Spline galaxy scene loaded successfully');
  };

  const handleError = (error: any) => {
    console.error('Error loading Spline scene:', error);
    console.log('Trying iframe approach...');
    setUseIframe(true);
  };

  // Use animated background for mobile, low-performance devices
  if (isMobile || isLowPerformance) {
    return <AnimatedGalaxyBackground className={className} />;
  }

  // Use iframe approach if React Spline fails
  if (useIframe) {
    return <SplineIframeGalaxy className={className} />;
  }

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Show animated background while loading */}
      {!isLoaded && <AnimatedGalaxyBackground />}

      {/* Spline 3D Scene - Enhanced responsive approach */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="w-full h-full min-w-full min-h-full" style={{
          width: '100vw',
          height: '100vh',
          minWidth: '100vw',
          minHeight: '100vh'
        }}>
          <Spline
            scene="https://prod.spline.design/n6TGU-9roDTNRzOW/scene.splinecode"
            onLoad={handleLoad}
            onError={handleError}
            style={{
              width: '100%',
              height: '100%',
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      </div>

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-navy/10 to-space-navy/30 pointer-events-none" />
    </div>
  );
}
