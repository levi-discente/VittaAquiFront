import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LogoTitle } from "@/components/ui/logo";
import AppointmentsScreen from "@/screens/Common/AppointmentsScreen";
import ProfileScreen from "@/screens/Common/ProfileScreen";
import ProfessionalHome from "@/screens/Professional/Home";
import { AvatarMenu } from "@/components/ui/AvatarMenu";
import EditProfileScreen from "@/screens/Professional/EditProfile";
import EditDoctorScheduler from "@/screens/Professional/EditDoctorScheduler";

export type ProfessionalStackParamList = {
  Home: undefined;
  Appointments: undefined;
  Profile: undefined;
  ConfigProfile: undefined;
  EditDoctorScheduler: undefined;
};

const Stack = createNativeStackNavigator<ProfessionalStackParamList>();

type Props = { initialScreen: keyof ProfessionalStackParamList };

const ProfessionalStack: React.FC<Props> = ({ initialScreen }) => (
  <Stack.Navigator initialRouteName={initialScreen}>
    <Stack.Screen
      name="Home"
      component={ProfessionalHome}
      options={{
        title: "Início",
        headerLeft: LogoTitle,
        headerRight: () => <AvatarMenu />,
      }}
    />
    <Stack.Screen
      name="Appointments"
      component={AppointmentsScreen}
      options={{
        title: "Agenda",
        headerLeft: LogoTitle,
        headerRight: () => <AvatarMenu />,
      }}
    />
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: "Perfil" }}
    />

    <Stack.Screen
      name="ConfigProfile"
      component={EditProfileScreen}
      options={{ title: "Editar Perfil" }}
    />

    <Stack.Screen
      name="EditDoctorScheduler"
      component={EditDoctorScheduler}
      options={{ title: "Agenda de Trabalho" }}
    />
  </Stack.Navigator>
);

export default ProfessionalStack;
