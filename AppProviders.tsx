import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <PermissionProvider>{children}</PermissionProvider>
  </AuthProvider>
);

export default AppProviders;

