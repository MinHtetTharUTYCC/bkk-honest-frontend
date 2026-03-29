'use client';

import { useQueryClient } from '@tanstack/react-query';
import { 
    useChecklistControllerCreate, 
    useChecklistControllerUpdate, 
    useChecklistControllerDelete, 
    useChecklistControllerFindAllInfinite, 
    useChecklistControllerGetStats 
} from '@/api/generated/checklist/checklist';
import { getNextSkipFromPage } from './base';

export function useMissions(status: string = 'all', sort: string = 'newest', userId: string = 'me') {
    return useChecklistControllerFindAllInfinite({
        status: status === 'all' ? undefined : status as any,
        sort: sort as any,
        take: 10
    }, {
        query: {
            queryKey: ['missions-infinite', userId, status, sort],
            getNextPageParam: (lastPage: any) => getNextSkipFromPage(lastPage),
            enabled: userId === 'me'
        }
    });
}

export function useMissionStats() {
    const query = useChecklistControllerGetStats({ query: { queryKey: ['mission-stats'] } });
    return { ...query, data: (query.data?.data as any) };
}

export function useAddMission() {
    const mutation = useChecklistControllerCreate();
    const queryClient = useQueryClient();
    return {
        ...mutation,
        mutate: (spotId: string) => mutation.mutate({ data: { spotId } }, {
            onSuccess: (response) => {
                const newItem = response.data;
                
                // 1. Update all variations of the missions list cache
                queryClient.setQueriesData({ queryKey: ['missions-infinite'] }, (old: any) => {
                    if (!old || !old.pages) return old;
                    const newPages = [...old.pages];
                    if (newPages.length > 0) {
                        const firstPage = { ...newPages[0] };
                        firstPage.data = [newItem, ...(firstPage.data || [])];
                        newPages[0] = firstPage;
                    } else {
                        newPages[0] = { data: [newItem] };
                    }
                    return { ...old, pages: newPages };
                });

                // 2. Update the specific spot detail cache to set isInMission to true and sync missionId
                const spotPredicate = (query: any) => {
                    const key = query.queryKey[0];
                    if (typeof key !== 'string') return false;
                    return key === 'spot' || key.startsWith('/spots');
                };

                queryClient.setQueriesData({ predicate: spotPredicate }, (old: any) => {
                    if (!old) return old;
                    const updateSpot = (s: any) => {
                      if (!s) return s;
                      const actualSpot = s.data || s;
                      if (actualSpot.id === spotId) {
                        return s.data 
                          ? { ...s, data: { ...s.data, isInMission: true, missionId: newItem.id } }
                          : { ...s, isInMission: true, missionId: newItem.id };
                      }
                      return s;
                    };
                    return updateSpot(old);
                });

                queryClient.invalidateQueries({ queryKey: ['mission-stats'] });
            }
        }),
        mutateAsync: (spotId: string) => mutation.mutateAsync({ data: { spotId } })
    };
}

export function useUpdateMission() {
    const mutation = useChecklistControllerUpdate();
    const queryClient = useQueryClient();
    return {
        ...mutation,
        mutate: ({ 
            id, 
            completed, 
            currentStatus = 'all',
            currentSort = 'newest'
        }: { 
            id: string; 
            completed: boolean;
            currentStatus?: string;
            currentSort?: string;
        }) => mutation.mutate({ id, data: { completed } }, {
            onSuccess: (response) => {
                const updatedItem = response.data;
                const currentKey = ['missions-infinite', 'me', currentStatus, currentSort];
                
                // Surgical update: remove from current tab if status changes
                queryClient.setQueryData(currentKey, (old: any) => {
                    if (!old || !old.pages) return old;
                    
                    // Remove item if switching status (pending → completed or vice versa)
                    const shouldRemove = 
                        (currentStatus === 'pending' && completed) ||
                        (currentStatus === 'completed' && !completed);
                    
                    if (shouldRemove) {
                        return {
                            ...old,
                            pages: old.pages.map((page: any) => ({
                                ...page,
                                data: page.data?.filter((m: any) => m.id !== id)
                            }))
                        };
                    }
                    
                    // Otherwise update in place (for 'all' tab)
                    return {
                        ...old,
                        pages: old.pages.map((page: any) => ({
                            ...page,
                            data: page.data?.map((m: any) => m.id === id ? { ...m, ...updatedItem } : m)
                        }))
                    };
                });
                
                // Invalidate other status tabs to sync when user switches
                const otherStatuses = ['pending', 'completed', 'all'].filter(s => s !== currentStatus);
                otherStatuses.forEach(status => {
                    queryClient.invalidateQueries({ 
                        queryKey: ['missions-infinite', 'me', status, currentSort] 
                    });
                });
                
                queryClient.invalidateQueries({ queryKey: ['mission-stats'] });
            }
        }),
        mutateAsync: ({ 
            id, 
            completed,
            currentStatus = 'all',
            currentSort = 'newest'
        }: { 
            id: string; 
            completed: boolean;
            currentStatus?: string;
            currentSort?: string;
        }) => mutation.mutateAsync({ id, data: { completed } })
    };
}

export function useDeleteMission() {
    const mutation = useChecklistControllerDelete();
    const queryClient = useQueryClient();
    return {
        ...mutation,
        mutate: (id: string, currentStatus = 'all', currentSort = 'newest') => mutation.mutate({ id }, {
            onSuccess: () => {
                let deletedSpotId: string | undefined;
                const currentKey = ['missions-infinite', 'me', currentStatus, currentSort];
                
                // Surgical update: remove from current tab
                queryClient.setQueryData(currentKey, (old: any) => {
                    if (!old || !old.pages) return old;
                    
                    for (const page of old.pages) {
                        const found = page.data?.find((m: any) => m.id === id);
                        if (found) {
                            deletedSpotId = found.spotId;
                            break;
                        }
                    }

                    return {
                        ...old,
                        pages: old.pages.map((page: any) => ({
                            ...page,
                            data: page.data?.filter((m: any) => m.id !== id)
                        }))
                    };
                });
                
                // Invalidate all other tabs to sync deletion
                const otherStatuses = ['pending', 'completed', 'all'].filter(s => s !== currentStatus);
                otherStatuses.forEach(status => {
                    queryClient.invalidateQueries({ 
                        queryKey: ['missions-infinite', 'me', status, currentSort] 
                    });
                });

                // 2. Update the specific spot detail cache to set isInMission to false and missionId to null
                const spotPredicate = (query: any) => {
                    const key = query.queryKey[0];
                    if (typeof key !== 'string') return false;
                    return key === 'spot' || key.startsWith('/spots');
                };

                queryClient.setQueriesData({ predicate: spotPredicate }, (old: any) => {
                    if (!old) return old;
                    const updateSpot = (s: any) => {
                      if (!s) return s;
                      const actualSpot = s.data || s;
                      if (actualSpot.id === deletedSpotId || actualSpot.missionId === id) {
                         return s.data
                           ? { ...s, data: { ...s.data, isInMission: false, missionId: null } }
                           : { ...s, isInMission: false, missionId: null };
                      }
                      return s;
                    };
                    return updateSpot(old);
                });

                queryClient.invalidateQueries({ queryKey: ['mission-stats'] });
            }
        }),
        mutateAsync: (id: string, currentStatus = 'all', currentSort = 'newest') => mutation.mutateAsync({ id })
    };
}
