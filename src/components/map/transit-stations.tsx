'use client';

import { Source, Layer } from 'react-map-gl/mapbox';
import type { LayerProps } from 'react-map-gl/mapbox';

interface TransitStationsProps {
  data: any; // GeoJSON data with station points
}

export default function TransitStations({ data }: TransitStationsProps) {
  if (!data || !data.features) {
    return null;
  }

  // Create a unique source ID for this data
  const sourceId = `transit-stations-data-${Math.random().toString(36).substr(2, 9)}`;

  // Create station circle layer
  const stationCircleStyle: LayerProps = {
    id: `transit-stations-${sourceId}`,
    type: 'circle',
    paint: {
      // Use the color from feature properties with fallback
      'circle-color': [
        'case',
        ['has', 'color'],
        ['get', 'color'],
        '#FFFFFF'
      ],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        13, 4,   // At zoom 13, radius is 4px
        16, 8,   // At zoom 16, radius is 8px
        20, 12   // At zoom 20, radius is 12px
      ],
      'circle-stroke-color': '#000000',
      'circle-stroke-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        13, 1,
        16, 2,
        20, 3
      ],
      'circle-opacity': 0.9,
      'circle-stroke-opacity': 0.8
    }
  };

  // Create station name labels
  const stationLabelStyle: LayerProps = {
    id: `transit-station-labels-${sourceId}`,
    type: 'symbol',
    layout: {
      'text-field': [
        'case',
        ['has', 'name'],
        ['get', 'name'],
        'Station'
      ],
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-size': [
        'interpolate',
        ['linear'],
        ['zoom'],
        13, 10,  // At zoom 13, text size is 10px
        16, 12,  // At zoom 16, text size is 12px
        20, 16   // At zoom 20, text size is 16px
      ],
      'text-offset': [0, 1.5],
      'text-anchor': 'top',
      'text-allow-overlap': false,
      'text-ignore-placement': false
    },
    paint: {
      'text-color': '#FFFFFF',
      'text-halo-color': '#000000',
      'text-halo-width': 2,
      'text-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        13, 0.8,
        14, 1,
        20, 1
      ]
    }
  };

  // Special styling for interchange stations
  const interchangeStationStyle: LayerProps = {
    id: `transit-interchange-${sourceId}`,
    type: 'circle',
    filter: [
      '>',
      ['length', ['get', 'interchange']],
      0
    ],
    paint: {
      'circle-color': '#FFFFFF',
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        13, 6,   // Larger than regular stations
        16, 10,
        20, 16
      ],
      'circle-stroke-color': '#FFD700', // Gold border for interchange
      'circle-stroke-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        13, 2,
        16, 3,
        20, 4
      ],
      'circle-opacity': 0.9,
      'circle-stroke-opacity': 1
    }
  };

  return (
    <Source
      id={sourceId}
      type="geojson"
      data={data}
    >
      {/* Render regular stations first */}
      <Layer {...stationCircleStyle} />
      
      {/* Render interchange stations on top (they're larger) */}
      <Layer {...interchangeStationStyle} />
      
      {/* Render station labels on top of everything */}
      <Layer {...stationLabelStyle} />
    </Source>
  );
}