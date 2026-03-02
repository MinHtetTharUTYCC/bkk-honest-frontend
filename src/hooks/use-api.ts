'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { components } from '@/types/api';

type PaginatedSpots = components['schemas']['PaginatedSpotsWithStatsResponseDto'];
type PaginatedScamAlerts = components['schemas']['PaginatedScamAlertsResponseDto'];

// --- Profiles ---

export function useProfile(id: string) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const response = await api.get<any>(`/profiles/${id}`);
      const data = response.data;
      return data?.data || data;
    },
    enabled: !!id,
    retry: false,
  });
}

export function useUserPriceReports(userId: string) {
  return useQuery({
    queryKey: ['user-price-reports', userId],
    queryFn: async () => {
      const { data } = await api.get(`/price-reports/user/${userId}`);
      return data?.data || (Array.isArray(data) ? data : []);
    },
    enabled: !!userId,
  });
}

export function useUserScamAlerts(userId: string) {
  return useQuery({
    queryKey: ['user-scam-alerts', userId],
    queryFn: async () => {
      const { data } = await api.get(`/scam-alerts/user/${userId}`);
      return data?.data || (Array.isArray(data) ? data : []);
    },
    enabled: !!userId,
  });
}

// --- Spots ---

export function useSpot(id: string) {
  return useQuery({
    queryKey: ['spot', id],
    queryFn: async () => {
      const { data } = await api.get<any>(`/spots/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
}

export function useSpots(params?: { categoryId?: string; cityId?: string; search?: string; sort?: 'newest' | 'popular' }) {
  // Clean up undefined parameters
  const cleanParams: any = {};
  if (params) {
    if (params.categoryId) cleanParams.categoryId = params.categoryId;
    if (params.cityId) cleanParams.cityId = params.cityId;
    if (params.search) cleanParams.search = params.search;
    if (params.sort) cleanParams.sort = params.sort;
  }

  return useQuery({
    queryKey: ['spots', cleanParams],
    queryFn: async () => {
      const { data } = await api.get<PaginatedSpots>('/spots', { params: cleanParams });
      // The backend returns { data: [...] }
      return data?.data || (Array.isArray(data) ? data : []);
    },
  });
}

export function useSpotPriceReports(spotId: string) {
  return useQuery({
    queryKey: ['price-reports', spotId],
    queryFn: async () => {
      const { data } = await api.get(`/price-reports/spot/${spotId}`);
      return data?.data || (Array.isArray(data) ? data : []);
    },
    enabled: !!spotId,
  });
}

export function useSpotTips(spotId: string) {
  return useQuery({
    queryKey: ['tips', spotId],
    queryFn: async () => {
      const { data } = await api.get(`/community-tips/spot/${spotId}`);
      return data?.data || (Array.isArray(data) ? data : []);
    },
    enabled: !!spotId,
  });
}

// --- Metadata ---

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<components['schemas']['CategoryDto'][]>('/categories');
      return Array.isArray(data) ? data : (data as any)?.data || [];
    },
  });
}

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data } = await api.get<any[]>('/cities');
      return Array.isArray(data) ? data : (data as any)?.data || [];
    },
  });
}

// --- Social & Alerts ---

export function useScamAlerts(params?: { cityId?: string; categoryId?: string }) {
  // Clean up undefined parameters
  const cleanParams: any = {};
  if (params) {
    if (params.cityId) cleanParams.cityId = params.cityId;
    if (params.categoryId) cleanParams.categoryId = params.categoryId;
  }

  return useQuery({
    queryKey: ['scam-alerts', cleanParams],
    queryFn: async () => {
      const { data } = await api.get<PaginatedScamAlerts>('/scam-alerts', { params: cleanParams });
      return data?.data || (Array.isArray(data) ? data : []);
    },
  });
}

export function useLiveVibes() {
  return useQuery({
    queryKey: ['live-vibes'],
    queryFn: async () => {
      const { data } = await api.get<any>('/live-vibes');
      return data?.data || (Array.isArray(data) ? data : []);
    },
  });
}

// --- Mutations ---

export function useCreatePriceReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { spotId: string; itemName: string; priceThb: number }) => {
      const { data } = await api.post('/price-reports', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spots'] });
    },
  });
}

export function useCreateScamAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { 
      scamName: string; 
      description: string; 
      preventionTip: string;
      cityId: string;
      categoryId: string;
    }) => {
      const { data } = await api.post('/scam-alerts', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scam-alerts'] });
    },
  });
}

export function useCreateLiveVibe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { spotId: string; crowdLevel: number; waitTimeMinutes: number }) => {
      const { data } = await api.post('/live-vibes', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-vibes'] });
      queryClient.invalidateQueries({ queryKey: ['spots'] });
    },
  });
}
