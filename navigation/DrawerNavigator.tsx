import React from 'react';
import { createDrawerNavigator, DrawerItem } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '@/hooks/useAuth';

import TabNavigator from './TabNavigator';
import ProfileScreen from '@/screens/Common/ProfileScreen';

export type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const CustomDrawerContent: React.FC<any> = props => {
  const { signOut } = useAuth();
  return (
    <DrawerItem
      label="Logout"
      onPress={signOut}
      icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />}
      labelStyle={{ color: '#d00' }}
    />
  );
};

const DrawerNavigator: React.FC = () => (
  <Drawer.Navigator
    drawerContent={props => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerActiveTintColor: '#007AFF',
    }}
  >
    <Drawer.Screen
      name="Home"
      component={TabNavigator}
      options={{
        title: 'Início',
        drawerIcon: ({ color, size }) => (
          <Ionicons name="home-outline" size={size} color={color} />
        ),
      }}
    />
    <Drawer.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        drawerIcon: ({ color, size }) => (
          <Ionicons name="person-circle" size={size} color={color} />
        ),
      }}
    />
  </Drawer.Navigator>
);

export default DrawerNavigator;

