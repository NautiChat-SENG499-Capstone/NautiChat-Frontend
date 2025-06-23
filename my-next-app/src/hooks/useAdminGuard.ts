'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminGuard() {
  const [checking, setChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const isAdmin = localStorage.getItem('is_admin');

    if (!token) {
      // Not logged in
      window.location.href = '/auth/login';
    } else if (isAdmin !== 'true') {
      // Logged in but not admin
      setIsAuthorized(false);
      setChecking(false);
    } else {
      setIsAuthorized(true);
      setChecking(false);
    }
  }, []);

  return { checking, isAuthorized };
}
