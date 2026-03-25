/**
 * Transit-related utility functions for Bangkok BTS/MRT system
 */

interface StationFeatureProperties {
  id?: string;
  name: string;
  name_th?: string;
  line: string;
  system: 'BTS' | 'MRT' | 'ARL';
  color: string;
  interchange?: string[];
}

interface StationFeature {
  properties: StationFeatureProperties;
  geometry: {
    coordinates: [number, number];
  };
}

interface StationFeatureCollection {
  features: StationFeature[];
}

export interface Station {
  id: string;
  name: string;
  name_th?: string;
  coordinates: [number, number]; // [lng, lat]
  line: string;
  system: 'BTS' | 'MRT' | 'ARL';
  color: string;
  interchange?: string[];
}

export interface NearestStation {
  station: Station;
  distance: number; // distance in meters
  walkingTime: number; // estimated walking time in minutes
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Estimate walking time based on distance
 * Uses average walking speed of 80m/min (4.8 km/h) for Bangkok conditions
 * @param distance Distance in meters
 * @returns Walking time in minutes
 */
export function estimateWalkingTime(distance: number): number {
  const walkingSpeedMPerMin = 80; // 80 meters per minute (conservative for Bangkok)
  return Math.ceil(distance / walkingSpeedMPerMin);
}

export function isStationFeatureCollection(value: unknown): value is StationFeatureCollection {
  return (
    typeof value === 'object' &&
    value !== null &&
    'features' in value &&
    Array.isArray((value as StationFeatureCollection).features) &&
    (value as StationFeatureCollection).features.every(
      (f) =>
        typeof f === 'object' &&
        f !== null &&
        'properties' in f &&
        typeof (f as StationFeature).properties === 'object' &&
        (f as StationFeature).properties !== null &&
        'geometry' in f &&
        typeof (f as StationFeature).geometry === 'object' &&
        (f as StationFeature).geometry !== null &&
        'coordinates' in (f as StationFeature).geometry
    )
  );
}

/**
 * Convert stations GeoJSON to Station objects
 * @param stationsGeoJSON GeoJSON FeatureCollection
 * @returns Array of Station objects
 */
export function parseStationsFromGeoJSON(stationsGeoJSON: unknown): Station[] {
  if (!isStationFeatureCollection(stationsGeoJSON)) {
    return [];
  }

  return stationsGeoJSON.features.map((feature: StationFeature) => ({
    id: feature.properties.id || feature.properties.name,
    name: feature.properties.name,
    name_th: feature.properties.name_th,
    coordinates: feature.geometry.coordinates,
    line: feature.properties.line,
    system: feature.properties.system,
    color: feature.properties.color,
    interchange: feature.properties.interchange || [] }));
}

/**
 * Find the nearest station to a given location
 * @param lat Latitude of the location
 * @param lng Longitude of the location
 * @param stations Array of Station objects
 * @returns NearestStation object or null if no stations
 */
export function findNearestStation(
  lat: number,
  lng: number,
  stations: Station[]
): NearestStation | null {
  if (!stations.length) {
    return null;
  }

  let nearestStation: Station | null = null;
  let minDistance = Infinity;

  for (const station of stations) {
    const distance = calculateDistance(
      lat,
      lng,
      station.coordinates[1], // lat is at index 1
      station.coordinates[0]  // lng is at index 0
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestStation = station;
    }
  }

  if (!nearestStation) {
    return null;
  }

  return {
    station: nearestStation,
    distance: minDistance,
    walkingTime: estimateWalkingTime(minDistance) };
}

/**
 * Find the N nearest stations to a given location
 * @param lat Latitude of the location
 * @param lng Longitude of the location
 * @param stations Array of Station objects
 * @param count Number of nearest stations to return (default: 3)
 * @returns Array of NearestStation objects sorted by distance
 */
export function findNearestStations(
  lat: number,
  lng: number,
  stations: Station[],
  count: number = 3
): NearestStation[] {
  if (!stations.length) {
    return [];
  }

  const stationsWithDistance = stations.map((station) => {
    const distance = calculateDistance(
      lat,
      lng,
      station.coordinates[1],
      station.coordinates[0]
    );

    return {
      station,
      distance,
      walkingTime: estimateWalkingTime(distance) };
  });

  // Sort by distance and return the nearest N stations
  return stationsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}

/**
 * Format distance for display
 * @param distance Distance in meters
 * @returns Formatted string (e.g., "150m" or "1.2km")
 */
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
}

/**
 * Format walking time for display
 * @param minutes Walking time in minutes
 * @returns Formatted string (e.g., "3 min walk")
 */
export function formatWalkingTime(minutes: number): string {
  return `${minutes} min walk`;
}

/**
 * Get system color for display
 * @param system Transit system type
 * @returns Color string
 */
export function getSystemColor(system: 'BTS' | 'MRT' | 'ARL'): string {
  switch (system) {
    case 'BTS':
      return '#00A651'; // BTS Green
    case 'MRT':
      return '#0047AB'; // MRT Blue
    case 'ARL':
      return '#FF0000'; // ARL Red
    default:
      return '#FFFFFF';
  }
}

/**
 * Get system display name
 * @param system Transit system type
 * @returns Display name
 */
export function getSystemDisplayName(system: 'BTS' | 'MRT' | 'ARL'): string {
  switch (system) {
    case 'BTS':
      return 'BTS Skytrain';
    case 'MRT':
      return 'MRT Subway';
    case 'ARL':
      return 'Airport Link';
    default:
      return system;
  }
}