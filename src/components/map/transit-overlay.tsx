'use client';

import { useState, useEffect } from 'react';
import TransitLines from './transit-lines';
import TransitStations from './transit-stations';

interface TransitOverlayProps {
  visible?: boolean;
  zoom: number;
  onLoading?: (loading: boolean) => void;
  onError?: (error: string | null) => void;
}

interface TransitData {
  btsLines: any;
  mrtLines: any;
  arlLines: any;
  stations: any;
}

export default function TransitOverlay({ 
  visible = false, 
  zoom,
  onLoading,
  onError
}: TransitOverlayProps) {
  const [transitData, setTransitData] = useState<TransitData | null>(null);
  const [loading, setLoading] = useState(false);

  // Load transit data when component becomes visible
  useEffect(() => {
    if (!visible || transitData || loading) return;

    const loadTransitData = async () => {
      setLoading(true);
      onLoading?.(true);
      onError?.(null);
      
      try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/bkk-honest';
        
        // Helper to fetch and check response
        const fetchGeoJSON = async (path: string) => {
          const res = await fetch(`${basePath}${path}`);
          if (!res.ok) throw new Error(`Failed to load ${path}: ${res.statusText}`);
          return res.json();
        };

        const [btsLines, mrtLines, arlLines, stations] = await Promise.all([
          fetchGeoJSON('/data/transit/bts-lines.geojson'),
          fetchGeoJSON('/data/transit/mrt-lines.geojson'),
          fetchGeoJSON('/data/transit/arl-lines.geojson'),
          fetchGeoJSON('/data/transit/stations.geojson')
        ]);

        setTransitData({
          btsLines,
          mrtLines,
          arlLines,
          stations
        });
      } catch (err) {
        console.error('Error loading transit data:', err);
        onError?.(err instanceof Error ? err.message : 'Failed to load transit data');
      } finally {
        setLoading(false);
        onLoading?.(false);
      }
    };

    loadTransitData();
  }, [visible, transitData, loading, onLoading, onError]);

  // Don't render anything if not visible or no data yet
  if (!visible || !transitData) {
    return null;
  }

  const shouldShowLines = zoom >= 10;
  const shouldShowStations = zoom >= 13;

  return (
    <>
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
