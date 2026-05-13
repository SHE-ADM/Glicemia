import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Role } from '@glicemia/shared';
import { useAuthContext } from '../contexts/AuthContext';

interface Props {
  children: ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { session, profile, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (allowedRoles && profile && !allowedRoles.includes(profile.role as Role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
