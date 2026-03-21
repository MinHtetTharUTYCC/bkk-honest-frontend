'use client';

import { Source, Layer, useMap } from 'react-map-gl/mapbox';
import type { LayerProps } from 'react-map-gl/mapbox';

interface TransitStationsProps {
    id: string;
    data: any; // GeoJSON data with station points
}

export default function TransitStations({ id, data }: TransitStationsProps) {
    // Guard: ensure MapContext is available before rendering Source
    const map = useMap();

    if (!data || !data.features || !map) {
        return null;
    }

    // Use the provided stable ID
    const sourceId = `transit-stations-data-${id}`;

    // Station icon symbols for different systems
    const stationIconStyle: LayerProps = {
        id: `transit-station-icons-${sourceId}`,
        type: 'symbol',
        layout: {
            'icon-image': [
                'case',
                ['==', ['get', 'system'], 'BTS'],
                'bts-icon',
                ['==', ['get', 'system'], 'MRT'],
                'mrt-icon',
                ['==', ['get', 'system'], 'ARL'],
                'arl-icon',
                'default-station-icon',
            ],
            'icon-size': ['interpolate', ['linear'], ['zoom'], 13, 0.3, 16, 0.5, 20, 0.8],
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
        },
        paint: {
            'icon-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.8, 14, 1, 20, 1],
        },
    };

    // Create station circle layer (fallback when icons aren't available)
    const stationCircleStyle: LayerProps = {
        id: `transit-stations-${sourceId}`,
        type: 'circle',
        paint: {
            // Use the color from feature properties with fallback
            'circle-color': [
                'case',
                ['==', ['get', 'system'], 'BTS'],
                '#00A651',
                ['==', ['get', 'system'], 'MRT'],
                '#0047AB',
                ['==', ['get', 'system'], 'ARL'],
                '#FF0000',
                '#FFFFFF',
            ],
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13,
                5, // At zoom 13, radius is 5px
                16,
                8, // At zoom 16, radius is 8px
                20,
                12, // At zoom 20, radius is 12px
            ],
            'circle-stroke-color': '#000000',
            'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 13, 1, 16, 2, 20, 3],
            'circle-opacity': 0.9,
            'circle-stroke-opacity': 0.8,
        },
    };

    // Create station name labels
    const stationLabelStyle: LayerProps = {
        id: `transit-station-labels-${sourceId}`,
        type: 'symbol',
        layout: {
            'text-field': ['case', ['has', 'name'], ['get', 'name'], 'Station'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13,
                9, // At zoom 13, text size is 9px
                16,
                11, // At zoom 16, text size is 11px
                20,
                14, // At zoom 20, text size is 14px
            ],
            'text-offset': [0, 2],
            'text-anchor': 'top',
            'text-allow-overlap': false,
            'text-ignore-placement': false,
            'text-max-width': 10,
        },
        paint: {
            'text-color': '#FFFFFF',
            'text-halo-color': '#000000',
            'text-halo-width': 2,
            'text-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.7, 14, 0.9, 20, 1],
        },
    };

    // Special styling for interchange stations
    const interchangeStationStyle: LayerProps = {
        id: `transit-interchange-${sourceId}`,
        type: 'circle',
        filter: ['>', ['length', ['get', 'interchange']], 0],
        paint: {
            'circle-color': '#FFFFFF',
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13,
                8, // Larger than regular stations
                16,
                12,
                20,
                18,
            ],
            'circle-stroke-color': '#FFD700', // Gold border for interchange
            'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 13, 3, 16, 4, 20, 6],
            'circle-opacity': 0.9,
            'circle-stroke-opacity': 1,
        },
    };

    // Interchange station labels (higher priority)
    const interchangeLabelStyle: LayerProps = {
        id: `transit-interchange-labels-${sourceId}`,
        type: 'symbol',
        filter: ['>', ['length', ['get', 'interchange']], 0],
        layout: {
            'text-field': ['case', ['has', 'name'], ['get', 'name'], 'Interchange'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13,
                10, // Slightly larger for interchange stations
                16,
                12,
                20,
                16,
            ],
            'text-offset': [0, 2.5],
            'text-anchor': 'top',
            'text-allow-overlap': false,
            'text-ignore-placement': false,
            'text-max-width': 10,
        },
        paint: {
            'text-color': '#FFD700', // Gold text for interchange stations
            'text-halo-color': '#000000',
            'text-halo-width': 2,
            'text-opacity': 1,
        },
    };

    return (
        <Source id={sourceId} type="geojson" data={data}>
            {/* Render regular stations first */}
            <Layer {...stationCircleStyle} />

            {/* Render interchange stations on top (they're larger) */}
            <Layer {...interchangeStationStyle} />

            {/* Render regular station labels */}
            <Layer {...stationLabelStyle} />

            {/* Render interchange station labels on top with special styling */}
            <Layer {...interchangeLabelStyle} />
        </Source>
    );
}
