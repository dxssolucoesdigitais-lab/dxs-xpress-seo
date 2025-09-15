import { useSession } from '@/contexts/SessionContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Skeleton } from '../ui/skeleton';

const AdminProtectedRoute = () => {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0f]">
        <div className="w-full max-w-md space-y-4 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    // Redirect non-admins to the dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;