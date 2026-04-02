'use client';

import { useEffect } from 'react';

export default function DebugPage() {
  useEffect(() => {
    console.log('[DEBUG] Environment check...');
    console.log('[DEBUG] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    
    const testApiFetch = async () => {
      // Test 1: Direct fetch call
      console.log('[DEBUG] Testing direct fetch to /cities...');
      try {
        const response = await fetch('/cities');
        console.log('[DEBUG] Response URL:', response.url);
        console.log('[DEBUG] Response status:', response.status);
      } catch (e) {
        console.error('[DEBUG] Fetch error:', e);
      }
    };
    
    testApiFetch();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>API Debug Page</h1>
      <p>Open browser console and Network tab to see API call details.</p>
    </div>
  );
}