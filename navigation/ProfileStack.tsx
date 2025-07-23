import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LogoTitle } from '@/components/ui/logo';
import HomeScreen from '@/screens/Patient/Home';
import AppointmentsScreen from '@/screens/Common/AppointmentsScreen';
import ProfessionalDetailScreen from '@/screens/Patient/ProfessionalDetailScreen';
import ProfileScreen from '@/screens/Common/ProfileScreen';
import { AvatarMenu } from '@/components/ui/AvatarMenu';

export type ProfileStackParamList = {
  Home: undefined;
  Appointments: undefined;
  ProfessionalDetail: { profileId: string };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

type ProfileStackProps = {
  initialScreen: keyof ProfileStackParamList;
};

const ProfileStack: React.FC<ProfileStackProps> = ({ initialScreen }) => (
  <Stack.Navigator initialRouteName={initialScreen}>
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'Início',
        headerLeft: LogoTitle,
        headerRight: () => <AvatarMenu />,
      }}
    />

    <Stack.Screen
      name="Appointments"
      component={AppointmentsScreen}
      options={{
        title: 'Agenda',
        headerLeft: LogoTitle,
        headerRight: () => <AvatarMenu />,
      }}
    />

    <Stack.Screen
      name="ProfessionalDetail"
      component={ProfessionalDetailScreen}
      options={{ title: 'Detalhes' }}
    />

    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Perfil' }}
    />
  </Stack.Navigator>
);

export default ProfileStack;

