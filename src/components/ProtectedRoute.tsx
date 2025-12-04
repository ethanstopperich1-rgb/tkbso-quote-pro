import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, contractor, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if onboarding is completed
  const settings = contractor?.settings;
  const onboardingCompleted = settings?.onboardingCompleted === true;
  
  // If on the onboarding page, allow access
  if (location.pathname === '/onboarding') {
    return <>{children}</>;
  }
  
  // If onboarding not completed and not on onboarding page, redirect to onboarding
  if (contractor && !onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
