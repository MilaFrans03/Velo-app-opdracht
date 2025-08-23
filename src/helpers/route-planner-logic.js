import { useState, useEffect } from 'react';
import { getDistance } from '@/helpers/get-distance';

// 📌 Adres → coördinaten via Nominatim API
async function geocodeAddress(address) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      {
        headers: {
          'User-Agent': 'YourAppName/1.0 (youremail@example.com)',
        },
      }
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.error('Geocoding failed:', err);
  }
  return null;
}

// 📌 Dichtstbijzijnde station zoeken
function getClosestStation(lat, lon, stations) {
  const sorted = stations
    .map((station) => ({
      ...station,
      distance: getDistance(lat, lon, station.latitude, station.longitude)
        .distance,
    }))
    .sort((a, b) => a.distance - b.distance);

  return sorted[0];
}

// 📌 Input verwerken naar coord + station
async function resolveInput(input, setCoord, setStation, location, stations) {
  if (!input) return;

  if (input === '📍 Gebruik huidige locatie') {
    setCoord(location);
    if (location.latitude && location.longitude) {
      const closest = getClosestStation(
        location.latitude,
        location.longitude,
        stations
      );
      setStation(closest);
    }
    return;
  }

  const exactStation = stations.find(
    (s) => s.name.toLowerCase() === input.toLowerCase()
  );
  if (exactStation) {
    setCoord({
      latitude: exactStation.latitude,
      longitude: exactStation.longitude,
    });
    setStation(exactStation);
    return;
  }

  const geocoded = await geocodeAddress(input);
  if (geocoded) {
    setCoord(geocoded);
    const closest = getClosestStation(
      geocoded.latitude,
      geocoded.longitude,
      stations
    );
    setStation(closest);
  }
}

// 📌 Custom hook met alle state & berekeningen
export function useRoutePlannerLogic(network) {
  const [filter1, setFilter1] = useState('');
  const [filter2, setFilter2] = useState('');
  const [showSuggestions1, setShowSuggestions1] = useState(false);
  const [showSuggestions2, setShowSuggestions2] = useState(false);

  const [location, setLocation] = useState({});
  const [coord1, setCoord1] = useState(null);
  const [coord2, setCoord2] = useState(null);
  const [station1, setStation1] = useState(null);
  const [station2, setStation2] = useState(null);

  // 📍 huidige locatie ophalen
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        (err) => console.error(err)
      );
    }
  }, []);

  // 📍 input1 en input2 resolveren
  useEffect(() => {
    if (network?.stations) {
      resolveInput(filter1, setCoord1, setStation1, location, network.stations);
    }
  }, [filter1, network, location]);

  useEffect(() => {
    if (network?.stations) {
      resolveInput(filter2, setCoord2, setStation2, location, network.stations);
    }
  }, [filter2, network, location]);

  // 📏 afstand berekenen
  let distanceBetween = null;
  if (coord1 && coord2) {
    distanceBetween =
      getDistance(
        coord1.latitude,
        coord1.longitude,
        coord2.latitude,
        coord2.longitude
      ).distance / 1000;
  }

  return {
    filter1,
    setFilter1,
    filter2,
    setFilter2,
    showSuggestions1,
    setShowSuggestions1,
    showSuggestions2,
    setShowSuggestions2,
    station1,
    station2,
    distanceBetween,
    location,
  };
}
