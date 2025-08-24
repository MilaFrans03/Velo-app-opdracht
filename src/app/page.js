'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import useNetwork from '@/data/network';
import { getDistance } from '@/helpers/get-distance';
import styles from './page.module.css';

export default function Home() {
  const [filter, setFilter] = useState('');
  const [location, setLocation] = useState({});
  const [topStations, setTopStations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const { network, isLoading, isError } = useNetwork();

  // Huidige locatie ophalen
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => console.error(err)
    );
  }, []);

  // Bereken afstanden en sorteer
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
          ).distance / 1000,
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [network, location]);

  // Stel top 3 en suggesties in
  useEffect(() => {
    if (stationsWithDistance.length === 0) return;
    setTopStations(stationsWithDistance.slice(0, 3));
    setSuggestions(stationsWithDistance.slice(3));
  }, [stationsWithDistance]);

  // Filterbare suggesties: alleen tonen als filter niet leeg is
  const filteredSuggestions = filter
    ? suggestions.filter((station) =>
        station.name.toLowerCase().includes(filter.toLowerCase())
      )
    : [];

  const handleFilterChange = (e) => setFilter(e.target.value);

  // Conditional rendering voor loading / error
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;
  if (!network?.stations || !location.latitude) return null;

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

      {/* Zoekbalk onder top 3 */}
      <h2 className={styles.title2}>Zoek naar een station</h2>
      <input
        type="text"
        value={filter}
        onChange={handleFilterChange}
        placeholder="Zoek stations..."
        className={styles.filter}
      />

      {/* Suggesties: max 3 */}
      {filteredSuggestions.length > 0 && (
        <>
          <div className={styles.stationsContainer}>
            {filteredSuggestions.slice(0, 3).map((station) => (
              <Link
                key={station.id}
                href={`/stations/${station.id}`}
                className={styles.stationCard}
              >
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
        </>
      )}
    </div>
  );
}
