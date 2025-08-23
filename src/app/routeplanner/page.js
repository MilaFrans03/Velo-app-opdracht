'use client';

import styles from '../page.module.css';
import { useState, useEffect } from 'react';
import useNetwork from '@/data/network';
import { useRoutePlannerLogic } from '@/helpers/route-planner-logic';

export default function Routeplanner() {
  const { network, isLoading, isError } = useNetwork();
  const logic = useRoutePlannerLogic(network);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  function renderInputField(
    filter,
    setFilter,
    showSuggestions,
    setShowSuggestions,
    stations
  ) {
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
              .filter((station) =>
                station.name.toLowerCase().includes(filter.toLowerCase())
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

  return (
    <div>
      {renderInputField(
        logic.filter1,
        logic.setFilter1,
        logic.showSuggestions1,
        logic.setShowSuggestions1,
        network.stations
      )}

      <div style={{ marginTop: '2rem' }}>
        {renderInputField(
          logic.filter2,
          logic.setFilter2,
          logic.showSuggestions2,
          logic.setShowSuggestions2,
          network.stations
        )}
      </div>

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

      {logic.station1 && logic.station2 && logic.distanceBetween !== null && (
        <p style={{ marginTop: '1rem' }}>
          📏 Afstand tussen <strong>{logic.station1.name}</strong> en{' '}
          <strong>{logic.station2.name}</strong>:{' '}
          {logic.distanceBetween.toFixed(2)} km
        </p>
      )}
    </div>
  );
}
