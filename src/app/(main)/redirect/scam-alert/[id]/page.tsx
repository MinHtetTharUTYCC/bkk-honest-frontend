'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getScamAlertUrl } from '@/lib/slug';
import { Loader2 } from 'lucide-react';

export default function RedirectScamAlertPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  useEffect(() => {
    const redirectToSlug = async () => {
      try {
        const { data: alert } = await api.get(`/scam-alerts/${id}`);
        if (alert?.data) {
          const slugUrl = getScamAlertUrl(alert.data.city?.name || 'Bangkok', alert.data.scamName);
          router.replace(slugUrl);
        } else {
          router.replace('/scam-alerts');
        }
      } catch (error) {
        console.error('Failed to fetch scam alert:', error);
        router.replace('/scam-alerts');
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
