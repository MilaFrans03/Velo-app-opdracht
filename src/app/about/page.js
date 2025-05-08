'use client';

import styles from './page.module.css';
import useNetwork from '@/data/network';

export default function About() {
  const { network, isLoading, isError } = useNetwork();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <div>
      <h1 className={styles.title}>About {network.name}</h1>
    </div>
  );
}
