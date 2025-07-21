import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import DrawerNavigator from './DrawerNavigator';

const Navigation: React.FC = () => {
  const { user, initializing } = useAuth();


  return user ? <DrawerNavigator /> : <AuthNavigator />;
};

export default Navigation;

