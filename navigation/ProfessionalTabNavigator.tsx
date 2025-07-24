import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ProfessionalStack from './ProfessionalStack';

export type ProfessionalTabParamList = {
  HomeTab: undefined;
  AppointmentsTab: undefined;
};

const Tab = createBottomTabNavigator<ProfessionalTabParamList>();


type FontAwesomeName = React.ComponentProps<typeof FontAwesome>['name'];

const ProfessionalTabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        const icons: Record<keyof ProfessionalTabParamList, FontAwesomeName> = {
          HomeTab: 'home',
          AppointmentsTab: 'calendar',
        };
        return <FontAwesome name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="HomeTab"
      options={{ title: 'Hoje' }}
    >
      {() => <ProfessionalStack initialScreen="Home" />}
    </Tab.Screen>
    <Tab.Screen
      name="AppointmentsTab"
      options={{ title: 'Agendamentos' }}
    >
      {() => <ProfessionalStack initialScreen="Appointments" />}
    </Tab.Screen>
  </Tab.Navigator>
);

export default ProfessionalTabNavigator;
