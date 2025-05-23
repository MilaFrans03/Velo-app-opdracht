'use client';

import styles from '../page.module.css';
import { useState, useEffect } from 'react';
import useNetwork from '@/data/network';
import { getDistance } from '@/helpers/get-distance';
import Link from 'next/link';

export default function Home() {
  const [filter, setFilter] = useState('');
  const [location, setLocation] = useState({});
  const { network, isLoading, isError } = useNetwork();
  const [showSuggestions, setShowSuggestions] = useState(false); // keuzelijst

  // use effect gebruiken om bv iets op te roepen enkel bij opstart van de app
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error(error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  const stations = network.stations.filter(
    (station) => station.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0
  );

  // map stations to add disrance to current location
  stations.map((station) => {
    station.distance =
      getDistance(
        location.latitude,
        location.longitude,
        station.latitude,
        station.longitude
      ).distance / 1000;
  });

  // sort stations by distance
  stations.sort((a, b) => a.distance - b.distance);

  function handleFilterChange(e) {
    setFilter(e.target.value);
  }

  return (
    <div>
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

            {stations.slice(0, 10).map((station) => (
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
    </div>
  );
}
