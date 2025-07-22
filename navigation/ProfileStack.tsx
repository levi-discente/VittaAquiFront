import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PatientHomeScreen from '@/screens/Patient/Home';
import ProfessionalDetailScreen from '@/screens/Patient/ProfessionalDetailScreen';

export type ProfileStackParamList = {
  PatientHome: undefined;
  ProfessionalDetail: { profileId: string };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen
      name="PatientHome"
      component={PatientHomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ProfessionalDetail"
      component={ProfessionalDetailScreen}
      options={{ title: "Detalhes", headerShown: true }}
    />
  </Stack.Navigator>
);

export default ProfileStack;

