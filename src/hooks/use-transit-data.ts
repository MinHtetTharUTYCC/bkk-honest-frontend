import { useMemo } from "react";

// Import the GeoJSON files as static data
async function loadTransitData() {
  try {
    // Since we can't directly import .geojson files, we'll load them from public directory
    const [btsResponse, mrtResponse, arlResponse, stationsResponse] =
      await Promise.all([
        fetch("/data/transit/bts-lines.geojson"),
        fetch("/data/transit/mrt-lines.geojson"),
        fetch("/data/transit/arl-lines.geojson"),
        fetch("/data/transit/stations.geojson"),
      ]);

    if (
      !btsResponse.ok ||
      !mrtResponse.ok ||
      !arlResponse.ok ||
      !stationsResponse.ok
    ) {
      throw new Error("Failed to load transit data");
    }

    const [btsLines, mrtLines, arlLines, stations] = await Promise.all([
      btsResponse.json(),
      mrtResponse.json(),
      arlResponse.json(),
      stationsResponse.json(),
    ]);

    return {
      btsLines,
      mrtLines,
      arlLines,
      stations,
    };
  } catch (error) {
    console.error("Error loading transit data:", error);
    throw error;
  }
}

export function useTransitData() {
  return useMemo(() => loadTransitData(), []);
}
