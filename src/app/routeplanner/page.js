'use client';

import styles from '../page.module.css';
import { useState, useEffect } from 'react';
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
    stations
  ) {
    if (!stations) return null;
    return (
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
            {stations
              .filter((s) =>
                s.name.toLowerCase().includes(filter.toLowerCase())
              )
              .slice(0, 10)
              .map((station) => (
                <li
                  key={station.id}
                  onClick={() => {
                    setFilter(station.name);
                    setShowSuggestions(false);
                  }}
                >
                  {station.name} ({station.free_bikes ?? 0} fietsen,{' '}
                  {station.empty_slots ?? 0} plaatsen)
                </li>
              ))}
          </ul>
        )}
      </div>
    );
  }

  const directionIcons = {
    0: '⬆️',
    1: '↖️',
    2: '↗️',
    3: '⬅️',
    4: '➡️',
    5: '⤴️',
    6: '⬇️',
    7: '🏁',
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <div>
      {/* Inputvelden */}
      {renderInputField(
        logic.filter1,
        logic.setFilter1,
        logic.showSuggestions1,
        logic.setShowSuggestions1,
        network?.stations
      )}
      <div style={{ marginTop: '2rem' }}>
        {renderInputField(
          logic.filter2,
          logic.setFilter2,
          logic.showSuggestions2,
          logic.setShowSuggestions2,
          network?.stations
        )}
      </div>

      {/* Info per station */}
      <div style={{ marginTop: '2rem' }}>
        {logic.station1 && (
          <p>
            📍 <strong>{logic.station1.name}</strong> —{' '}
            {logic.station1.free_bikes ?? 0} fietsen,{' '}
            {logic.station1.empty_slots ?? 0} plaatsen
          </p>
        )}
        {logic.station2 && (
          <p>
            📍 <strong>{logic.station2.name}</strong> —{' '}
            {logic.station2.free_bikes ?? 0} fietsen,{' '}
            {logic.station2.empty_slots ?? 0} plaatsen
          </p>
        )}
      </div>

      {/* Afstand en duur */}
      {logic.station1 && logic.station2 && distance !== null && (
        <p style={{ marginTop: '1rem' }}>
          📏 Route-afstand: {(distance / 1000).toFixed(2)} km <br />⏱ Reistijd:{' '}
          {(duration / 60).toFixed(0)} minuten
        </p>
      )}

      {/* Route-instructies met highlight en grotere tekst */}
      {instructions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            🗺️ Routebeschrijving
          </h3>
          <ol style={{ listStyle: 'none', padding: 0 }}>
            {instructions.map((step, idx) => {
              const icon = directionIcons[step.type] || '➡️';
              return (
                <li
                  key={idx}
                  style={{
                    background: '#f0f8ff',
                    padding: '10px 15px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                  }}
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

      {/* Geen instructies */}
      {!isError && instructions.length === 0 && start && end && (
        <p>Geen routebeschrijving beschikbaar.</p>
      )}

      {/* Debug info */}
      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'gray' }}>
        <h4>Debug info</h4>
        <p>Start: {start ? start.join(', ') : 'Geen start'}</p>
        <p>End: {end ? end.join(', ') : 'Geen eindpunt'}</p>
      </div>
    </div>
  );
}
