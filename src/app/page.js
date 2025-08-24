'use client';

import styles from './page.module.css';

import { useState, useEffect } from 'react';
import useNetwork from '@/data/network';
import { getDistance } from '@/helpers/get-distance';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function Home() {
  const [filter, setFilter] = useState('');
  const [location, setLocation] = useState({});
  const { network, isLoading, isError } = useNetwork();

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
      <h1 className={styles.title}>Dichtsbijzijnde stations</h1>

      <input
        type="text"
        value={filter}
        onChange={handleFilterChange}
        placeholder="Zoek stations..."
        className={styles.filter}
      />

      <div className={styles.stationsContainer}>
        {stations
          .slice(0, 3) // alleen de top 3
          .map((station, index) => (
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
    </div>
  );
}
