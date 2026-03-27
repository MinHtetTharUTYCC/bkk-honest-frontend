import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { createClient } from '@/lib/supabase/client';

export const AXIOS_INSTANCE: AxiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

// Automatically inject Supabase JWT for authenticated requests
AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  // Only execute auth fetching on the client-side
  if (typeof window !== 'undefined') {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        config.headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      console.error('[Orval Mutator] Error fetching Supabase session:', e);
    }
  }
  return config;
});

// Custom instance wrapper for Orval
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
