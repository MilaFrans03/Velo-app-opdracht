'use client';

import styles from '../page.module.css';
import useNetwork from '@/data/network';
import { useRoutePlannerLogic } from '@/helpers/route-planner-logic';
import useRoute from '@/data/routedescription';

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
            <div
              className={styles.stationCard}
              onClick={() => {
                setFilter('Gebruik huidige locatie');
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

  // berekeningen wandeltijd & fietstijd
  const walkingSpeed = 5; // km/u
  const cyclingSpeed = 15; // km/u
  const walkingTime =
    distance !== null ? (distance / 1000 / walkingSpeed) * 60 : null;
  const cyclingTime =
    distance !== null ? (distance / 1000 / cyclingSpeed) * 60 : null;

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
        network?.stations,
        'Eindstation'
      )}

      {/* Afstand en tijden */}
      {logic.station1 && logic.station2 && distance !== null && (
        <div style={{ marginTop: '1rem' }}>
          <p>
            <strong>Route-afstand:</strong> {(distance / 1000).toFixed(2)} km
          </p>
          <p>
            <strong>Fietstijd:</strong> {(duration / 60).toFixed(0)} minuten
          </p>
          <p>
            <strong>Wandeltijd:</strong>{' '}
            {walkingTime !== null ? walkingTime.toFixed(0) : '-'} minuten
          </p>
          <p>
            <strong>Fietstijd:</strong>{' '}
            {cyclingTime !== null ? cyclingTime.toFixed(0) : '-'} minuten
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
