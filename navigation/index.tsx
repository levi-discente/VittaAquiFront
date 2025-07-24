import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../context/PermissionContext';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import ProfessionalTabNavigator from './ProfessionalTabNavigator';

const Navigation: React.FC = () => {
  const { user, initializing } = useAuth();
  const { canViewPatientHome, canViewProfessionalAgenda } = usePermissions();

  if (!user) return <AuthNavigator />;
  if (canViewProfessionalAgenda) return <ProfessionalTabNavigator />;
  return <TabNavigator />;
};

export default Navigation;

