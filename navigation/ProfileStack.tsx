import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

import { LogoTitle } from '@/components/ui/logo';
import HomeScreen from '@/screens/Patient/Home';
import AppointmentsScreen from '@/screens/Common/AppointmentsScreen';
import ProfessionalDetailScreen from '@/screens/Patient/ProfessionalDetailScreen';
import ProfileScreen from '@/screens/Common/ProfileScreen';

import { TabParamList } from './TabNavigator';
import { AvatarMenu } from '@/components/ui/AvatarMenu';

export type ProfileStackParamList = {
  Home: undefined;
  Appointments: undefined;
  ProfessionalDetail: { profileId: string };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const Spacer = () => <View style={{ width: 32, height: 32 }} />;

export const ProfileStack: React.FC = () => {
  const route =
    useRoute<RouteProp<TabParamList, keyof TabParamList>>();

  const initialScreen = route.params?.initialScreen ?? 'Home';

  return (
    <Stack.Navigator
      initialRouteName={initialScreen}
      screenOptions={{
        headerTitleAlign: 'center',
        headerLeft: LogoTitle,
        headerRight: () => <AvatarMenu />,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Início' }}
      />
      <Stack.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{ title: 'Agenda' }}
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
};

export default ProfileStack;

