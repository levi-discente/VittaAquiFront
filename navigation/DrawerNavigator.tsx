import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '@/hooks/useAuth';

import TabNavigator from './TabNavigator';
import ProfileScreen from '@/screens/Profile/ProfileScreen';

export type DrawerParamList = {
  Início: undefined;
  Perfil: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const CustomDrawerContent: React.FC<any> = (props) => {
  const { signOut } = useAuth();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, justifyContent: 'flex-start' }}
    >
      <DrawerItemList {...props} />

      <DrawerItem
        label="Sair"
        onPress={signOut}
        icon={({ color, size }) => (
          <Ionicons name="log-out-outline" size={size} color={color} />
        )}
        style={{ marginTop: 'auto', borderTopWidth: 1, borderColor: '#e0e0e0' }}
        labelStyle={{ color: '#d00' }}
      />
    </DrawerContentScrollView>
  );
};

const DrawerNavigator: React.FC = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      drawerActiveTintColor: '#007AFF',
    }}
  >
    <Drawer.Group >
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
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Group>
  </Drawer.Navigator>
);

export default DrawerNavigator;

