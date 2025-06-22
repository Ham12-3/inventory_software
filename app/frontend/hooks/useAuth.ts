import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        const authenticated = !!token;
        setIsAuthenticated(authenticated);
        setIsLoading(false);
        
        // If not authenticated and not on login page, redirect to login
        if (!authenticated && router.pathname !== '/login') {
          router.push('/login');
        }
        
        // If authenticated and on login page, redirect to dashboard
        if (authenticated && router.pathname === '/login') {
          router.push('/dashboard');
        }
      }
    };

    checkAuth();
  }, [router]);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      setIsAuthenticated(false);
      router.push('/login');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
  };
};

export default useAuth; 