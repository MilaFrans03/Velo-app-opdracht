'use client';

import styles from '../page.module.css';
import { useState, useEffect } from 'react';
import useNetwork from '@/data/network';
import { getDistance } from '@/helpers/get-distance';

export default function Home() {
  const [filter1, setFilter1] = useState('');
  const [filter2, setFilter2] = useState('');
  const [showSuggestions1, setShowSuggestions1] = useState(false);
  const [showSuggestions2, setShowSuggestions2] = useState(false);
  const [location, setLocation] = useState({});
  const { network, isLoading, isError } = useNetwork();

  const [coord1, setCoord1] = useState(null);
  const [coord2, setCoord2] = useState(null);
  const [station1, setStation1] = useState(null);
  const [station2, setStation2] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.error(error)
      );
    }
  }, []);

  useEffect(() => {
    resolveInput(filter1, setCoord1, setStation1);
  }, [filter1]);

  useEffect(() => {
    resolveInput(filter2, setCoord2, setStation2);
  }, [filter2]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  function getClosestStation(lat, lon) {
    const sorted = network.stations
      .map((station) => ({
        ...station,
        distance: getDistance(lat, lon, station.latitude, station.longitude)
          .distance,
      }))
      .sort((a, b) => a.distance - b.distance);

    return sorted[0];
  }

  async function geocodeAddress(address) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)',
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

  async function resolveInput(input, setCoord, setStation) {
    if (!input) return;

    if (input === '📍 Gebruik huidige locatie') {
      setCoord(location);
      if (location.latitude && location.longitude) {
        const closest = getClosestStation(
          location.latitude,
          location.longitude
        );
        setStation(closest);
      }
      return;
    }

    const exactStation = network.stations.find(
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
      const closest = getClosestStation(geocoded.latitude, geocoded.longitude);
      setStation(closest);
    }
  }

  function renderInputField(
    filter,
    setFilter,
    showSuggestions,
    setShowSuggestions,
    stations
  ) {
    return (
      <div>
        <input
          type="text"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />

        {showSuggestions && filter.length > 0 && (
          <ul>
            <li
              onClick={() => {
                setFilter('📍 Gebruik huidige locatie');
                setShowSuggestions(false);
              }}
            >
              📍 Gebruik huidige locatie
            </li>
            {stations
              .filter((station) =>
                station.name.toLowerCase().includes(filter.toLowerCase())
              )
              .slice(0, 10)
              .map((station) => (
                <li
                  key={station.id}
                  onClick={() => {
                    setFilter(station.name);
                    setShowSuggestions(false);
                  }}
                >
                  {station.name}
                </li>
              ))}
          </ul>
        )}
      </div>
    );
  }

  let distanceBetween = null;
  if (
    coord1 &&
    coord2 &&
    typeof coord1.latitude === 'number' &&
    typeof coord2.latitude === 'number'
  ) {
    distanceBetween =
      getDistance(
        coord1.latitude,
        coord1.longitude,
        coord2.latitude,
        coord2.longitude
      ).distance / 1000;
  }

  return (
    <div>
      {/* Eerste zoekveld */}
      {renderInputField(
        filter1,
        setFilter1,
        showSuggestions1,
        setShowSuggestions1,
        network.stations
      )}

      {/* Tweede zoekveld */}
      <div style={{ marginTop: '2rem' }}>
        {renderInputField(
          filter2,
          setFilter2,
          showSuggestions2,
          setShowSuggestions2,
          network.stations
        )}
      </div>

      {/* Resultaat */}
      <div style={{ marginTop: '2rem' }}>
        {station1 && station2 && distanceBetween !== null && (
          <p>
            📏 Afstand tussen <strong>{station1.name}</strong> en{' '}
            <strong>{station2.name}</strong>: {distanceBetween.toFixed(2)} km
          </p>
        )}
      </div>
    </div>
  );
}
