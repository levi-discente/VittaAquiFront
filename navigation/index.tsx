import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const Navigation: React.FC = () => {
  const { user, initializing } = useAuth();


  return user ? <TabNavigator /> : <AuthNavigator />;
};

export default Navigation;

