'use client';

import { useState, useEffect } from 'react';

export function useRoutePlannerLogic(network) {
  const [filter1, setFilter1] = useState('');
  const [filter2, setFilter2] = useState('');
  const [showSuggestions1, setShowSuggestions1] = useState(false);
  const [showSuggestions2, setShowSuggestions2] = useState(false);

  const [station1, setStation1] = useState(null);
  const [station2, setStation2] = useState(null);

  const [coord1, setCoord1] = useState(null);
  const [coord2, setCoord2] = useState(null);

  const [distanceBetween, setDistanceBetween] = useState(null);

  const [watchId, setWatchId] = useState(null);

  // 📌 Start live tracking voor "huidige locatie"
  const useCurrentLocation = (setFilter, setCoord) => {
    if (!navigator.geolocation) {
      alert('Geolocatie wordt niet ondersteund.');
      return;
    }

    // Stop eerdere watch
    if (watchId) navigator.geolocation.clearWatch(watchId);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoord({ latitude, longitude });
        setFilter('Huidige locatie');
      },
      (error) => {
        alert('Kon huidige locatie niet ophalen.');
        console.error(error);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    setWatchId(id);
  };

  // Zoek stations en/of gebruik huidige locatie
  useEffect(() => {
    if (!network?.stations) return;

    // Station 1
    if (filter1 && filter1.toLowerCase() !== 'huidige locatie') {
      const s1 = network.stations.find(
        (s) => s.name.toLowerCase() === filter1.toLowerCase()
      );
      if (s1) {
        setStation1(s1);
        setCoord1({ latitude: s1.latitude, longitude: s1.longitude });
      } else {
        setStation1(null);
      }
    }

    // Station 2
    if (filter2 && filter2.toLowerCase() !== 'huidige locatie') {
      const s2 = network.stations.find(
        (s) => s.name.toLowerCase() === filter2.toLowerCase()
      );
      if (s2) {
        setStation2(s2);
        setCoord2({ latitude: s2.latitude, longitude: s2.longitude });
      } else {
        setStation2(null);
      }
    }
  }, [filter1, filter2, network]);

  // Bereken afstand (Haversine)
  useEffect(() => {
    if (!coord1 || !coord2) {
      setDistanceBetween(null);
      return;
    }

    const R = 6371; // km
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setDistanceBetween(R * c);
  }, [coord1, coord2]);

  const walkingSpeed = 5;
  const cyclingSpeed = 15;
  const walkingTime =
    distanceBetween !== null ? (distanceBetween / walkingSpeed) * 60 : null;
  const cyclingTime =
    distanceBetween !== null ? (distanceBetween / cyclingSpeed) * 60 : null;

  return {
    filter1,
    setFilter1,
    showSuggestions1,
    setShowSuggestions1,
    station1,
    coord1,
    setCoord1,

    filter2,
    setFilter2,
    showSuggestions2,
    setShowSuggestions2,
    station2,
    coord2,
    setCoord2,

    distanceBetween,
    walkingTime,
    cyclingTime,

    useCurrentLocation,
  };
}
