import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export function ProtectedRoute() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
