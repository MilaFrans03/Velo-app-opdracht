'use client';

import styles from '../page.module.css';
import useNetwork from '@/data/network';
import { useRoutePlannerLogic } from '@/helpers/route-planner-logic';
import useRoute from '@/data/routedescription';
import CompassComponent from '@/components/Compas'; // import compass component

export default function Routeplanner() {
  const { network, isLoading, isError } = useNetwork();
  const logic = useRoutePlannerLogic(network);

  const start = logic.coord1
    ? [logic.coord1.longitude, logic.coord1.latitude]
    : null;
  const end = logic.coord2
    ? [logic.coord2.longitude, logic.coord2.latitude]
    : null;

  const { instructions, distance, duration } = useRoute(start, end);

  function renderInputField(
    filter,
    setFilter,
    showSuggestions,
    setShowSuggestions,
    coord,
    setCoord,
    stations,
    placeholder
  ) {
    if (!stations) return null;

    return (
      <div className={styles.stationsContainer}>
        <input
          className={styles.filter}
          type="text"
          value={filter}
          placeholder={placeholder}
          onChange={(e) => {
            setFilter(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />

        {showSuggestions && filter.length > 0 && (
          <div className={styles.stationsContainer}>
            {/* Gebruik huidige locatie */}
            <div
              className={styles.stationCard}
              onClick={() => {
                logic.useCurrentLocation(setFilter, setCoord);
                setShowSuggestions(false);
              }}
            >
              Gebruik huidige locatie
            </div>

            {stations
              .filter((s) =>
                s.name.toLowerCase().includes(filter.toLowerCase())
              )
              .slice(0, 10)
              .map((station) => (
                <div
                  key={station.id}
                  className={styles.stationCard}
                  onClick={() => {
                    setFilter(station.name);
                    setCoord({
                      latitude: station.latitude,
                      longitude: station.longitude,
                    });
                    setShowSuggestions(false);
                  }}
                >
                  <div className={styles.stationName}>{station.name}</div>
                  <div className={styles.stationDistance}>
                    {station.free_bikes ?? 0} fietsen,{' '}
                    {station.empty_slots ?? 0} plaatsen
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  }

  const directionIcons = {
    0: '↑',
    1: '↖',
    2: '↗',
    3: '←',
    4: '→',
    5: '↗',
    6: '↓',
    7: 'Eind',
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <div>
      <h1 className={styles.title}>Stations zoeken</h1>

      {/* Van */}
      <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
        <strong>Van</strong>
      </div>
      {renderInputField(
        logic.filter1,
        logic.setFilter1,
        logic.showSuggestions1,
        logic.setShowSuggestions1,
        logic.coord1,
        logic.setCoord1,
        network?.stations,
        'Startstation'
      )}

      {/* Naar */}
      <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
        <strong>Naar</strong>
      </div>
      {renderInputField(
        logic.filter2,
        logic.setFilter2,
        logic.showSuggestions2,
        logic.setShowSuggestions2,
        logic.coord2,
        logic.setCoord2,
        network?.stations,
        'Eindstation'
      )}

      {/* Compass component */}
      <CompassComponent />

      {/* Afstand en tijden */}
      {logic.coord1 && logic.coord2 && logic.distanceBetween !== null && (
        <div style={{ marginTop: '1rem' }}>
          <p>
            <strong>Route-afstand:</strong> {logic.distanceBetween.toFixed(2)}{' '}
            km
          </p>
          <p>
            <strong>Wandeltijd:</strong>{' '}
            {logic.walkingTime !== null ? logic.walkingTime.toFixed(0) : '-'}{' '}
            minuten
          </p>
          <p>
            <strong>Fietstijd:</strong>{' '}
            {logic.cyclingTime !== null ? logic.cyclingTime.toFixed(0) : '-'}{' '}
            minuten
          </p>
          <p>
            <strong>Fietstijd via route:</strong>{' '}
            {duration ? (duration / 60).toFixed(0) : '-'} minuten
          </p>
        </div>
      )}

      {/* Route-instructies */}
      {instructions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Routebeschrijving</h3>
          <ol style={{ listStyle: 'none', padding: 0 }}>
            {instructions.map((step, idx) => {
              const icon = directionIcons[step.type] || '→';
              return (
                <li
                  key={idx}
                  className={styles.stationCard}
                  style={{ fontSize: '1.1rem', fontWeight: '500' }}
                >
                  {icon} {step.instruction} <br />
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>
                    ({step.distance.toFixed(0)} m)
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {!isError && instructions.length === 0 && start && end && (
        <p>Geen routebeschrijving beschikbaar.</p>
      )}
    </div>
  );
}
