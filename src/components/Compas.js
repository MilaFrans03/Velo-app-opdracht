'use client';

import { useState, useEffect } from 'react';

export default function CompassComponent() {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleOrientation(event) {
      let alpha = event.alpha;
      if (typeof event.webkitCompassHeading !== 'undefined') {
        // iOS ondersteuning
        alpha = event.webkitCompassHeading;
      }
      if (alpha !== null) {
        setHeading(Math.round(alpha));
      }
    }

    // Vraag toestemming op iOS
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      DeviceOrientationEvent.requestPermission
    ) {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === 'granted') {
            window.addEventListener(
              'deviceorientation',
              handleOrientation,
              true
            );
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
      <div
        style={{
          width: '100px',
          height: '100px',
          border: '2px solid black',
          borderRadius: '50%',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '2px',
            height: '40px',
            backgroundColor: 'red',
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: `translateX(-50%) rotate(${heading}deg)`,
            transformOrigin: 'bottom center',
          }}
        />
      </div>
      <p>Heading: {heading}°</p>
    </div>
  );
}
