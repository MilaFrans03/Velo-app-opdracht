'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import useNetwork from '@/data/network';
import { getDistance } from '@/helpers/get-distance';
import StationImage from '@/components/StationImage';
import styles from './page.module.css';

export default function Home() {
  const defaultLocation = { latitude: 51.9244, longitude: 4.4777 }; // Rotterdam als fallback
  const [filter, setFilter] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [topStations, setTopStations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const { network, isLoading, isError } = useNetwork();

  // Huidige locatie ophalen
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocatie niet beschikbaar, gebruik fallback locatie.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.error('Kon huidige locatie niet ophalen:', err.message || err);
        alert('Kon huidige locatie niet ophalen, gebruik standaardlocatie.');
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Bereken afstanden en sorteer stations
  const stationsWithDistance = useMemo(() => {
    if (!network?.stations || !location.latitude) return [];
    return network.stations
      .map((station) => ({
        ...station,
        distance:
          getDistance(
            location.latitude,
            location.longitude,
            station.latitude,
            station.longitude
          ).distance / 1000, // km
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [network, location]);

  // Stel top 3 en suggesties in
  useEffect(() => {
    if (stationsWithDistance.length === 0) return;
    setTopStations(stationsWithDistance.slice(0, 3));
    setSuggestions(stationsWithDistance.slice(3));
  }, [stationsWithDistance]);

  // Filterbare suggesties
  const filteredSuggestions = filter
    ? suggestions.filter((station) =>
        station.name.toLowerCase().includes(filter.toLowerCase())
      )
    : [];

  const handleFilterChange = (e) => setFilter(e.target.value);

  // Loading / error checks
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;
  if (!network?.stations) return null;

  return (
    <div>
      <h1 className={styles.title}>Stations zoeken</h1>

      {/* Top 3 stations */}
      <h2 className={styles.title2}>Dichtsbijzijnde stations</h2>
      <div className={styles.stationsContainer}>
        {topStations.map((station, index) => (
          <Link
            key={station.id}
            href={`/stations/${station.id}`}
            className={styles.stationCard}
          >
            <StationImage station={station} />
            <div className={styles.stationName}>
              {index + 1}. {station.name}
            </div>
            <div className={styles.stationDistance}>
              <MapPin
                size={16}
                style={{ marginRight: '6px', verticalAlign: 'middle' }}
              />
              {station.distance.toFixed(2)} km
            </div>
          </Link>
        ))}
      </div>

      {/* Zoekbalk */}
      <h2 className={styles.title2}>Zoek naar een station</h2>
      <input
        type="text"
        value={filter}
        onChange={handleFilterChange}
        placeholder="Zoek stations..."
        className={styles.filter}
      />

      {/* Suggesties */}
      {filteredSuggestions.length > 0 && (
        <div className={styles.stationsContainer}>
          {filteredSuggestions.slice(0, 3).map((station) => (
            <Link
              key={station.id}
              href={`/stations/${station.id}`}
              className={styles.stationCard}
            >
              <StationImage station={station} />
              <div className={styles.stationName}>{station.name}</div>
              <div className={styles.stationDistance}>
                <MapPin
                  size={16}
                  style={{ marginRight: '6px', verticalAlign: 'middle' }}
                />
                {station.distance.toFixed(2)} km
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
