'use client';

import styles from './page.module.css';
import useNetwork from '@/data/network';
import { useParams } from 'next/navigation';
import StationImage from '@/components/StationImage';

export default function Station() {
  const { network, isLoading, isError } = useNetwork();
  const params = useParams();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  const station = network.stations.find(
    (station) => station.id === params.stationId
  );

  return (
    <div>
      <h1 className={styles.title}>{station.name}</h1>
      <p>{station.free_bikes}</p>
      <StationImage station={station} />
    </div>
  );
}
