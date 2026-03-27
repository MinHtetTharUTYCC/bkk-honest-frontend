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
  config: AxiosRequestConfig | string,
  options?: any,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  
  // Transform body -> data for Axios compatibility
  const requestConfig = {
      ...(typeof config === 'string' ? { url: config } : config),
      ...(options || {}),
  };
  if (requestConfig.body) {
      requestConfig.data = requestConfig.body;
      delete requestConfig.body;
  }

  const promise = AXIOS_INSTANCE({
    ...requestConfig,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
