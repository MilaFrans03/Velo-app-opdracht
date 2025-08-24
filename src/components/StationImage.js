'use client';

import useImage from '@/data/image';

export default function StationImage({ station }) {
  const { image, isLoading, isError } = useImage(station);

  if (isLoading) {
    return (
      <div style={{ height: 150, background: '#eee', borderRadius: '12px' }}>
        Laden...
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ height: 150, background: '#fdd', borderRadius: '12px' }}>
        Error
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={station.name}
      style={{
        width: '100%',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '12px',
        marginBottom: '8px',
      }}
    />
  );
}
