import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { PermissionProvider } from '@/context/PermissionContext';

const Navigation: React.FC = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  return (
    <NavigationContainer>
      {user ? (
        <PermissionProvider>
          <AppNavigator />
        </PermissionProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Navigation;
