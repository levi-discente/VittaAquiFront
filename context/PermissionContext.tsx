import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Permissions {
  canViewPatientHome: boolean;
  canViewProfessionalAgenda: boolean;
}

const PermissionContext = createContext<Permissions>({
  canViewPatientHome: false,
  canViewProfessionalAgenda: false,
});

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const perms = useMemo<Permissions>(() => ({
    canViewPatientHome: user?.role === 'patient',
    canViewProfessionalAgenda: user?.role === 'professional',
  }), [user]);

  return (
    <PermissionContext.Provider value={perms}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);
