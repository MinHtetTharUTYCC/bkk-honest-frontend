'use client';

import { useState, useRef } from 'react';
import Map, { Marker, ViewState, MapRef } from 'react-map-gl/mapbox';
import type { MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';


const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface LocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
  initialLocation?: { latitude: number; longitude: number };
  label?: string;
  required?: boolean;
  isLoading?: boolean;
  height?: string;
}

export function LocationPicker({
  onLocationSelect,
  initialLocation,
  label,
  required = false,
  isLoading = false,
  height = 'h-80' }: LocationPickerProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<ViewState>({
    latitude: initialLocation?.latitude || 13.7563,
    longitude: initialLocation?.longitude || 100.5018,
    zoom: 14,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 } });
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(
    initialLocation || null
  );
  const [isGeolocating, setIsGeolocating] = useState(false);

  const fetchAddressFromCoordinates = async (lat: number, lng: number): Promise<string | undefined> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('API URL not configured');
        return undefined;
      }

      const response = await fetch(`${apiUrl}/spots/reverse-geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }) });
      if (response.ok) {
        const data = await response.json();
        return data.address;
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
    }
    return undefined;
  };

  const handleMapClick = async (e: MapMouseEvent) => {
    if (isLoading) return;
    const { lng, lat } = e.lngLat;
    const location = { latitude: lat, longitude: lng };
    setSelectedLocation(location);
    
    const address = await fetchAddressFromCoordinates(lat, lng);
    onLocationSelect({ ...location, address });
  };

  const handleCurrentLocation = async () => {
    if (isLoading || !navigator.geolocation) return;
    
    setIsGeolocating(true);
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const location = { latitude, longitude };
          setSelectedLocation(location);
          setViewState(prev => ({
            ...prev,
            latitude,
            longitude,
            zoom: 16
          }));
          
          const address = await fetchAddressFromCoordinates(latitude, longitude);
          onLocationSelect({ ...location, address });
        },
        () => {
          console.error('Failed to get user location');
        }
      );
    } finally {
      setIsGeolocating(false);
    }
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
        <p className="text-sm text-red-400">Mapbox token is not configured</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest">
          {label}
          {required && <span className="text-amber-400 ml-1">*</span>}
        </label>
      )}
      
      <div className={cn("relative rounded-2xl overflow-hidden border border-white/10", height || "h-80 md:h-[600px] lg:h-screen")}>
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          cursor={isLoading ? 'not-allowed' : 'crosshair'}
          style={{ width: '100%', height: '100%' }}
        >
          {selectedLocation && (
            <Marker
              latitude={selectedLocation.latitude}
              longitude={selectedLocation.longitude}
              anchor="bottom"
            >
              <div className="animate-bounce">
                <MapPin size={32} className="text-amber-400 drop-shadow-lg" fill="currentColor" />
              </div>
            </Marker>
          )}
        </Map>

        {/* Location info overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
            <MapPin size={14} className="text-amber-400" />
            <span className="text-xs font-medium text-white">
              {selectedLocation
                ? `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`
                : 'Click to select location'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={isLoading || isGeolocating}
            className={cn(
              "bg-amber-500 hover:bg-amber-400 text-black p-2 rounded-lg transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Use current location"
            title="Use current location"
          >
            {isGeolocating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Navigation size={16} />
            )}
          </button>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="text-amber-400 animate-spin" />
              <span className="text-xs text-white/70">Loading...</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-white/50">
        Click on the map to select a location, or use the button to use your current location.
      </p>
    </div>
  );
}
