import React from 'react';

interface DeviceFrameProps {
  imageUrl: string;
  frameType: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'none';
  alt?: string;
  className?: string;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({
  imageUrl,
  frameType,
  alt = 'Portfolio image',
  className = ''
}) => {
  // No frame - just show the image
  if (frameType === 'none') {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-auto rounded-lg shadow-light-md dark:shadow-dark-md ${className}`}
      />
    );
  }

  // Desktop Monitor Frame
  if (frameType === 'desktop') {
    return (
      <div className={`relative ${className}`}>
        {/* Monitor body */}
        <div className="bg-gradient-to-b from-neutral-700 to-neutral-800 rounded-xl p-[6px] shadow-light-xl dark:shadow-dark-xl">
          {/* Inner bezel */}
          <div className="bg-neutral-900 rounded-lg p-1">
            {/* Screen */}
            <div className="rounded overflow-hidden bg-black">
              <img
                src={imageUrl}
                alt={alt}
                className="w-full h-auto block"
              />
            </div>
          </div>
          {/* Bottom chin with logo dot */}
          <div className="flex items-center justify-center py-1.5">
            <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
          </div>
        </div>
        {/* Stand neck */}
        <div className="mx-auto w-16 h-5 bg-gradient-to-b from-neutral-700 to-neutral-600 rounded-b-sm"></div>
        {/* Stand base */}
        <div className="mx-auto w-40 h-2.5 bg-gradient-to-b from-neutral-600 to-neutral-700 rounded-b-xl rounded-t-sm shadow-light-md dark:shadow-dark-md"></div>
      </div>
    );
  }

  // Laptop Frame
  if (frameType === 'laptop') {
    return (
      <div className={`relative ${className}`}>
        {/* Screen lid */}
        <div className="bg-gradient-to-b from-neutral-700 to-neutral-800 rounded-t-xl p-[5px] shadow-light-xl dark:shadow-dark-xl">
          {/* Camera */}
          <div className="flex justify-center mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-600"></div>
          </div>
          {/* Inner bezel */}
          <div className="bg-neutral-900 rounded-lg p-0.5">
            <div className="rounded overflow-hidden bg-black">
              <img
                src={imageUrl}
                alt={alt}
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
        {/* Hinge line */}
        <div className="h-[2px] bg-neutral-600 mx-[2px]"></div>
        {/* Keyboard base */}
        <div className="bg-gradient-to-b from-neutral-700 to-neutral-800 h-3.5 rounded-b-xl shadow-light-lg dark:shadow-dark-lg relative overflow-hidden">
          {/* Trackpad hint */}
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-neutral-600/30 rounded-t-sm"></div>
        </div>
      </div>
    );
  }

  // Tablet Frame
  if (frameType === 'tablet') {
    return (
      <div className={`relative mx-auto max-w-md ${className}`}>
        <div className="bg-gradient-to-b from-neutral-700 to-neutral-800 rounded-2xl p-[6px] shadow-light-xl dark:shadow-dark-xl">
          {/* Camera */}
          <div className="flex justify-center mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-600"></div>
          </div>
          {/* Screen */}
          <div className="bg-neutral-900 rounded-xl p-0.5">
            <div className="rounded-[10px] overflow-hidden bg-black">
              <img
                src={imageUrl}
                alt={alt}
                className="w-full h-auto block"
              />
            </div>
          </div>
          {/* Bottom spacing */}
          <div className="h-2"></div>
        </div>
      </div>
    );
  }

  // Mobile Phone Frame
  if (frameType === 'mobile') {
    return (
      <div className={`relative mx-auto max-w-xs ${className}`}>
        <div className="bg-gradient-to-b from-neutral-700 to-neutral-800 rounded-[2rem] p-[5px] shadow-light-xl dark:shadow-dark-xl">
          {/* Screen with notch area */}
          <div className="bg-black rounded-[1.7rem] overflow-hidden relative">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-neutral-900 rounded-full z-10 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 ring-1 ring-neutral-700"></div>
            </div>
            <img
              src={imageUrl}
              alt={alt}
              className="w-full h-auto block"
            />
          </div>
          {/* Bottom indicator bar */}
          <div className="flex justify-center py-1.5">
            <div className="w-24 h-1 bg-neutral-600 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DeviceFrame;
