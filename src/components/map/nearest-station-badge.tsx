import { Train } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  formatDistance, 
  formatWalkingTime, 
  getSystemColor, 
  getSystemDisplayName,
  type NearestStation 
} from '@/lib/transit-utils';

interface NearestStationBadgeProps {
  nearestStation: NearestStation | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function NearestStationBadge({ 
  nearestStation, 
  className,
  size = 'md'
}: NearestStationBadgeProps) {
  if (!nearestStation) {
    return null;
  }

  const { station, distance, walkingTime } = nearestStation;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2'
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full bg-black/80 text-white font-medium backdrop-blur-sm border border-white/10",
        sizeClasses[size],
        className
      )}
      title={`${station.name} (${getSystemDisplayName(station.system)}) - ${formatWalkingTime(walkingTime)}`}
    >
      <Train 
        size={iconSizes[size]} 
        style={{ color: getSystemColor(station.system) }}
        aria-hidden="true"
      />
      <span className="font-bold" style={{ color: getSystemColor(station.system) }}>
        {station.system}
      </span>
      <span className="text-white/80">
        {station.name}
      </span>
      <span className="text-white/60 text-xs">
        {formatDistance(distance)}
      </span>
    </div>
  );
}

interface MultipleStationsProps {
  nearestStations: NearestStation[];
  className?: string;
  maxShow?: number;
}

export function MultipleStationsBadge({ 
  nearestStations, 
  className,
  maxShow = 2
}: MultipleStationsProps) {
  if (!nearestStations.length) {
    return null;
  }

  const stationsToShow = nearestStations.slice(0, maxShow);
  const remainingCount = nearestStations.length - maxShow;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {stationsToShow.map((nearest, index) => (
        <NearestStationBadge
          key={`${nearest.station.id}-${index}`}
          nearestStation={nearest}
          size="sm"
        />
      ))}
      {remainingCount > 0 && (
        <div className="inline-flex items-center px-2 py-1 rounded-full bg-black/60 text-white/60 text-xs">
          +{remainingCount} more
        </div>
      )}
    </div>
  );
}

interface StationDistanceDisplayProps {
  nearestStation: NearestStation;
  showWalkingTime?: boolean;
  className?: string;
}

export function StationDistanceDisplay({ 
  nearestStation, 
  showWalkingTime = true,
  className 
}: StationDistanceDisplayProps) {
  const { station, distance, walkingTime } = nearestStation;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1.5">
        <Train 
          size={14} 
          style={{ color: getSystemColor(station.system) }}
          aria-hidden="true"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-sm" style={{ color: getSystemColor(station.system) }}>
            {station.system}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {getSystemDisplayName(station.system)}
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-sm">
          {station.name}
        </span>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{formatDistance(distance)}</span>
          {showWalkingTime && (
            <>
              <span>•</span>
              <span>{formatWalkingTime(walkingTime)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}