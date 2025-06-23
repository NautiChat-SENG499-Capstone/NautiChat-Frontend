'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminGuard() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const isAdmin = localStorage.getItem('is_admin');

    if (!token || isAdmin !== 'true') {
      router.push('/auth/login');
    } else {
      setChecking(false);
    }
  }, []);

  return { checking };
}
