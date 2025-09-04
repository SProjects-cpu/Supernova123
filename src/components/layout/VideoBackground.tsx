
import React from 'react';

const VideoBackground: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        poster="/video-poster.jpg" // Optional: a poster image while the video loads
      >
        <source src="/space-background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-deep-blue/70"></div>
    </div>
  );
};

export default VideoBackground;
