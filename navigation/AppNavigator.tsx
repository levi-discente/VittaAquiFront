import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import HomeScreen from '@/screens/Home';
import { usePermissions } from '@/context/PermissionContext';
import PatientHomeScreen from '@/screens/Home';

export type AppStackParamList = {
  PatientHome: undefined;
  ProfessionalAgenda: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ProfessionalList: undefined;
};


const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator: React.FC = () => {
  const { canViewPatientHome, canViewProfessionalAgenda } = usePermissions();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {canViewProfessionalAgenda && (
        <Stack.Screen
          name="ProfessionalAgenda"
          component={EditProfileScreen}
        />
      )}

      {canViewPatientHome && (
        <Stack.Screen
          name="PatientHome"
          component={PatientHomeScreen}
        />
      )}

      {/* Rotas comuns a ambos os perfis */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

