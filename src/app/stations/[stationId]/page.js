'use client';

import styles from './page.module.css';
import useNetwork from '@/data/network';
import { useParams } from 'next/navigation';
import StationImage from '@/components/StationImage';
import { useRouter } from 'next/navigation';

export default function Station() {
  const router = useRouter();
  const { network, isLoading, isError } = useNetwork();
  const params = useParams();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  const station = network.stations.find((s) => s.id === params.stationId);

  if (!station) return <div>Station niet gevonden</div>;

  const goToRoute = () => {
    if (!navigator.geolocation) {
      alert('Geolocatie niet beschikbaar');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const startLat = pos.coords.latitude;
        const startLon = pos.coords.longitude;

        // Stuur naar routeplanner pagina met query params
        router.push(
          `/routeplanner?startLat=${startLat}&startLon=${startLon}&endLat=${station.latitude}&endLon=${station.longitude}`
        );
      },
      (err) => {
        alert('Kan huidige locatie niet ophalen');
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div>
      <h1 className={styles.title}>{station.name}</h1>
      <StationImage station={station} />

      <p>
        Beschikbare fietsen: {station.free_bikes} <br />
        Beschikbare plaatsen: {station.empty_slots}
      </p>

      <div className={styles.routeContainer}>
        <button className={styles.routeButton} onClick={goToRoute}>
          Route
        </button>
      </div>
    </div>
  );
}
