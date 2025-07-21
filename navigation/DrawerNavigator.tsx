import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';

import TabNavigator from './TabNavigator';
import ProfileScreen from '@/screens/Profile/ProfileScreen';
import EditProfileScreen from '@/screens/Profile/EditProfileScreen';

export type DrawerParamList = {
  Início: undefined;
  Perfil: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator: React.FC = () => (
  <Drawer.Navigator
    screenOptions={{
      drawerActiveTintColor: '#007AFF',
    }}
  >
    <Drawer.Screen
      name="Início"
      component={TabNavigator}
      options={{
        drawerIcon: ({ color, size }) => (
          <Ionicons name="home-outline" size={size} color={color} />
        ),
      }}
    />
    <Drawer.Screen
      name="Perfil"
      component={EditProfileScreen}
      options={{
        drawerIcon: ({ color, size }) => (
          <Ionicons name="person-circle-outline" size={size} color={color} />
        ),
      }}
    />
  </Drawer.Navigator>
);

export default DrawerNavigator;
