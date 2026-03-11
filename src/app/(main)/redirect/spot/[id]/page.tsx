'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getSpotUrl } from '@/lib/slug';
import { Loader2 } from 'lucide-react';

export default function RedirectSpotPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  useEffect(() => {
    const redirectToSlug = async () => {
      try {
        const { data: spot } = await api.get(`/spots/${id}`);
        if (spot?.data) {
          const slugUrl = getSpotUrl(spot.data.city?.name || 'Bangkok', spot.data.name);
          router.replace(slugUrl);
        } else {
          router.replace('/spots');
        }
      } catch (error) {
        console.error('Failed to fetch spot:', error);
        router.replace('/spots');
      }
    };

    redirectToSlug();
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto mb-4" size={32} />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
