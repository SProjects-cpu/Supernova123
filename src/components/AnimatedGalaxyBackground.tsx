import { useEffect, useState } from 'react';

interface AnimatedGalaxyBackgroundProps {
  className?: string;
}

export function AnimatedGalaxyBackground({ className = "" }: AnimatedGalaxyBackgroundProps) {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; animationDelay: number }>>([]);

  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 200; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          animationDelay: Math.random() * 4
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-space-navy via-charcoal to-dark-blue" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-r from-cosmic-purple/30 via-transparent to-stellar-blue/30 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-nebula-pink/20 via-transparent to-supernova-gold/20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Animated stars */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-starlight-white animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-electric-blue rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      {/* Nebula clouds */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-cosmic-purple/40 to-transparent rounded-full blur-3xl animate-slow-spin" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-radial from-nebula-pink/40 to-transparent rounded-full blur-3xl animate-slow-spin-reverse" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-radial from-stellar-blue/40 to-transparent rounded-full blur-3xl animate-slow-spin" style={{ animationDelay: '5s' }} />
      </div>

      {/* Galaxy spiral arms */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-conic from-supernova-gold/30 via-transparent via-transparent to-supernova-gold/30 animate-slow-spin" />
        <div className="absolute inset-0 bg-gradient-conic from-electric-blue/20 via-transparent via-transparent to-electric-blue/20 animate-slow-spin-reverse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Shooting stars */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={`shooting-star-${i}`}
            className="absolute w-1 h-1 bg-starlight-white rounded-full animate-shooting-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      {/* Central galaxy glow */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <div className="w-96 h-96 bg-gradient-radial from-supernova-gold/30 via-plasma-orange/20 to-transparent rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-navy/10 to-space-navy/30 pointer-events-none" />
      

    </div>
  );
}
