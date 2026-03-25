'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SpotCard from '@/components/spots/spot-card';
import ScamAlertCard from '@/components/scams/scam-alert-card';
import { CardSkeleton, ScamAlertCardSkeleton } from '@/components/ui/skeleton';
import { useInfiniteSpots, useInfiniteScamAlerts } from '@/hooks/use-api';
import { useInView } from 'react-intersection-observer';

interface SearchResultsTabsProps {
  query: string;
  categoryId?: string;
  sort?: 'newest' | 'popular';
  activeTab?: 'spots' | 'scams';
  onTabChange?: (tab: 'spots' | 'scams') => void;
  cityId?: string;
}

export function SearchResultsTabs({
  query,
  categoryId,
  sort = 'popular',
  activeTab = 'spots',
  onTabChange,
  cityId,
}: SearchResultsTabsProps) {
  const [tab, setTab] = useState(activeTab);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (activeTab && activeTab !== tab) {
      setTimeout(() => setTab(activeTab), 0);
    }
  }, [activeTab, tab]);

  // Fetch spots
  const {
    data: spotsData,
    isLoading: spotsLoading,
    isFetchingNextPage: spotsFetchingNextPage,
    hasNextPage: spotsHasNextPage,
    fetchNextPage: spotsFetchNextPage,
  } = useInfiniteSpots({
    search: query,
    categoryId,
    sort,
    cityId,
    take: 10,
  });

  // Fetch scam alerts
  const {
    data: scamsData,
    isLoading: scamsLoading,
    isFetchingNextPage: scamsFetchingNextPage,
    hasNextPage: scamsHasNextPage,
    fetchNextPage: scamsFetchNextPage,
  } = useInfiniteScamAlerts({
    search: query,
    categoryId,
    sort,
    cityId,
    take: 10,
  });

  // Load more when in view
  useEffect(() => {
    if (inView) {
      if (tab === 'spots' && spotsHasNextPage && !spotsFetchingNextPage) {
        spotsFetchNextPage();
      } else if (tab === 'scams' && scamsHasNextPage && !scamsFetchingNextPage) {
        scamsFetchNextPage();
      }
    }
  }, [
    inView,
    tab,
    spotsHasNextPage,
    spotsFetchingNextPage,
    scamsHasNextPage,
    scamsFetchingNextPage,
    spotsFetchNextPage,
    scamsFetchNextPage,
  ]);

  const handleTabChange = (newTab: string) => {
    setTab(newTab as 'spots' | 'scams');
    onTabChange?.(newTab as 'spots' | 'scams');
  };

  // Flatten paginated data
  const spots = spotsData?.pages?.flatMap((page: unknown) => page.data || []) || [];
  const scams = scamsData?.pages?.flatMap((page: unknown) => page.data || []) || [];

  const spotsCount = spotsData?.pages?.[0]?.pagination?.total || spots.length;
  const scamsCount = scamsData?.pages?.[0]?.pagination?.total || scams.length;

  return (
    <div className="flex-1">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 p-1 mb-6">
          <TabsTrigger
            value="spots"
            data-state={tab === 'spots' ? 'active' : 'inactive'}
            className="data-[state=active]:bg-amber-400/20 data-[state=active]:text-amber-400"
          >
            Spots {spotsCount > 0 && `(${spotsCount})`}
          </TabsTrigger>
          <TabsTrigger
            value="scams"
            data-state={tab === 'scams' ? 'active' : 'inactive'}
            className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
          >
            Scam Alerts {scamsCount > 0 && `(${scamsCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spots" className="space-y-4">
          {spotsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : spots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 text-sm">No spots found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spots.map((spot: unknown) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
              {(spotsHasNextPage || spotsFetchingNextPage) && (
                <div ref={ref} className="h-10 flex items-center justify-center">
                  {spotsFetchingNextPage && (
                    <div className="text-xs text-white/40">Loading more...</div>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="scams" className="space-y-4">
          {scamsLoading ? (
            <div className="flex flex-col gap-4">
              {[...Array(4)].map((_, i) => (
                <ScamAlertCardSkeleton key={i} />
              ))}
            </div>
          ) : scams.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 text-sm">No scam alerts found</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {scams.map((scam: unknown) => (
                  <ScamAlertCard key={scam.id} alert={scam} />
                ))}
              </div>
              {(scamsHasNextPage || scamsFetchingNextPage) && (
                <div ref={ref} className="h-10 flex items-center justify-center">
                  {scamsFetchingNextPage && (
                    <div className="text-xs text-white/40">Loading more...</div>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
