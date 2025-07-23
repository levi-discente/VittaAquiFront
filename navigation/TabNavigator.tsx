import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ProfileStack, { ProfileStackParamList } from './ProfileStack';

export type TabParamList = {
  HomeTab: { initialScreen?: keyof ProfileStackParamList };
  AppointmentsTab: { initialScreen?: keyof ProfileStackParamList };
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, string> = {
          HomeTab: 'home-outline',
          AppointmentsTab: 'calendar-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen
      name="HomeTab"
      component={ProfileStack}
      options={{ title: 'Início' }}
      initialParams={{ initialScreen: 'Home' }}
    />

    <Tab.Screen
      name="AppointmentsTab"
      component={ProfileStack}
      options={{ title: 'Agenda' }}
      initialParams={{ initialScreen: 'Appointments' }}
    />
  </Tab.Navigator>
);

export default TabNavigator;

