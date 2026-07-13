import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import type { Role } from '@/types';

interface AuthGuardProps {
  allowedRoles: Role[];
}

const AuthGuard = ({ allowedRoles }: AuthGuardProps) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default AuthGuard;
