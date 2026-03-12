'use client';

import { useState, useEffect } from 'react';
import TransitLines from './transit-lines';
import TransitStations from './transit-stations';

interface TransitOverlayProps {
  visible?: boolean;
  zoom: number;
}

interface TransitData {
  btsLines: any;
  mrtLines: any;
  arlLines: any;
  stations: any;
}

export default function TransitOverlay({ visible = false, zoom }: TransitOverlayProps) {
  const [transitData, setTransitData] = useState<TransitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load transit data when component becomes visible
  useEffect(() => {
    if (!visible || transitData) return;

    const loadTransitData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load all transit GeoJSON files from public directory (prefixing with basePath)
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/bkk-honest';
        const [btsResponse, mrtResponse, arlResponse, stationsResponse] = await Promise.all([
          fetch(`${basePath}/data/transit/bts-lines.geojson`),
          fetch(`${basePath}/data/transit/mrt-lines.geojson`),
          fetch(`${basePath}/data/transit/arl-lines.geojson`),
          fetch(`${basePath}/data/transit/stations.geojson`)
        ]);

        if (!btsResponse.ok || !mrtResponse.ok || !arlResponse.ok || !stationsResponse.ok) {
          throw new Error('Failed to load transit data');
        }

        const [btsLines, mrtLines, arlLines, stations] = await Promise.all([
          btsResponse.json(),
          mrtResponse.json(),
          arlResponse.json(),
          stationsResponse.json()
        ]);

        setTransitData({
          btsLines,
          mrtLines,
          arlLines,
          stations
        });
      } catch (err) {
        console.error('Error loading transit data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transit data');
      } finally {
        setLoading(false);
      }
    };

    loadTransitData();
  }, [visible, transitData]);

  // Don't render anything if not visible
  if (!visible) {
    return null;
  }

  // Show loading state
  if (loading && !transitData) {
    return (
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm z-10">
        Loading transit data...
      </div>
    );
  }

  // Show error state
  if (error && !transitData) {
    return (
      <div className="absolute top-4 left-4 bg-red-500/90 text-white px-3 py-2 rounded-lg text-sm z-10">
        Error: {error}
      </div>
    );
  }

  // Don't render if no data loaded yet
  if (!transitData) {
    return null;
  }

  const shouldShowLines = zoom >= 10;
  const shouldShowStations = zoom >= 13;

  return (
    <>
      {/* Screen reader context for transit overlay */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite"
        aria-label="Transit overlay information"
      >
        {shouldShowLines && (
          <span>
            Transit lines are now visible on the map. 
            {shouldShowStations && ' Station names and icons are also displayed.'}
          </span>
        )}
      </div>

      {/* Transit Lines - visible at zoom 10+ */}
      {shouldShowLines && (
        <>
          <TransitLines id="bts" data={transitData.btsLines} />
          <TransitLines id="mrt" data={transitData.mrtLines} />
          <TransitLines id="arl" data={transitData.arlLines} />
        </>
      )}
      
      {/* Transit Stations - visible at zoom 13+ */}
      {shouldShowStations && (
        <TransitStations id="stations" data={transitData.stations} />
      )}
    </>
  );
}