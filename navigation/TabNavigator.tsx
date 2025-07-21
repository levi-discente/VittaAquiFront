import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import PatientHomeScreen from '@/screens/Home';
import ProfessionalAgendaScreen from '@/screens/Professional/ProfessionalFormScreen'; // ou outro componente de agenda
import { usePermissions } from '@/context/PermissionContext';

export type TabParamList = {
  Home: undefined;
  Agenda: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  const { canViewPatientHome, canViewProfessionalAgenda } = usePermissions();

  return (

    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home: 'home-outline',
            Agenda: 'calendar-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      {/* Home fica sempre */}
      <Tab.Screen
        name="Home"
        component={PatientHomeScreen}
        options={{ title: 'Início' }}
      />

      {/* Agenda só para quem tem permissão */}
      {canViewProfessionalAgenda && (
        <Tab.Screen
          name="Agenda"
          component={ProfessionalAgendaScreen}
          options={{ title: 'Agenda' }}
        />
      )}
    </Tab.Navigator>

  );
};

export default TabNavigator;

