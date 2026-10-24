import { useState, useEffect, useCallback } from "react";
import {
  parseStationsFromGeoJSON,
  findNearestStation,
  findNearestStations,
  type Station,
  type NearestStation,
} from "@/lib/utils/transit-utils";

interface UseNearestStationReturn {
  stations: Station[];
  loading: boolean;
  error: string | null;
  findNearest: (lat: number, lng: number) => NearestStation | null;
  findNearestMultiple: (
    lat: number,
    lng: number,
    count?: number,
  ) => NearestStation[];
}

export function useNearestStation(): UseNearestStationReturn {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStationData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/data/transit/stations.geojson");

        if (!response.ok) {
          throw new Error(`Failed to fetch stations: ${response.status}`);
        }

        const stationsGeoJSON = await response.json();
        const parsedStations = parseStationsFromGeoJSON(stationsGeoJSON);

        setStations(parsedStations);
      } catch (err) {
        console.error("Error loading transit stations:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load transit data",
        );
      } finally {
        setLoading(false);
      }
    };

    loadStationData();
  }, []);

  const findNearest = useCallback(
    (lat: number, lng: number) => {
      return findNearestStation(lat, lng, stations);
    },
    [stations],
  );

  const findNearestMultiple = useCallback(
    (lat: number, lng: number, count = 3) => {
      return findNearestStations(lat, lng, stations, count);
    },
    [stations],
  );

  return {
    stations,
    loading,
    error,
    findNearest,
    findNearestMultiple,
  };
}
