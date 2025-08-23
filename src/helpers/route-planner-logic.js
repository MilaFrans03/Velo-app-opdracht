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

  //  Zoek stations en zet coördinaten meteen goed
  useEffect(() => {
    if (!network?.stations) return;

    const s1 = network.stations.find(
      (s) => s.name.toLowerCase() === filter1.toLowerCase()
    );
    const s2 = network.stations.find(
      (s) => s.name.toLowerCase() === filter2.toLowerCase()
    );

    if (s1) {
      setStation1(s1);
      setCoord1({ latitude: s1.latitude, longitude: s1.longitude });
    } else {
      setStation1(null);
      setCoord1(null);
    }

    if (s2) {
      setStation2(s2);
      setCoord2({ latitude: s2.latitude, longitude: s2.longitude });
    } else {
      setStation2(null);
      setCoord2(null);
    }
  }, [filter1, filter2, network]);

  // Bereken afstand (haversine)
  useEffect(() => {
    if (!coord1 || !coord2) {
      setDistanceBetween(null);
      return;
    }

    const R = 6371; // km
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setDistanceBetween(R * c);
  }, [coord1, coord2]);

  return {
    filter1,
    setFilter1,
    showSuggestions1,
    setShowSuggestions1,
    station1,

    filter2,
    setFilter2,
    showSuggestions2,
    setShowSuggestions2,
    station2,

    coord1,
    coord2,
    distanceBetween,
  };
}
