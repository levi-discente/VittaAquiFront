import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import ProfessionalListScreen from '../screens/Professional/ProfessionalListScreen';
import HomeScreen from '@/screens/Home';

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ProfessionalList: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Meu Perfil' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Editar Perfil' }} />
    <Stack.Screen
      name="ProfessionalList"
      component={ProfessionalListScreen}
      options={{ title: 'Profissionais' }}
    />
  </Stack.Navigator>
);

export default AppNavigator;

