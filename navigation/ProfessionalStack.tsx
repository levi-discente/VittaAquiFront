import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LogoTitle } from "@/components/ui/logo";
import AppointmentsScreen from "@/screens/Common/AppointmentsScreen";
import ProfileScreen from "@/screens/Common/ProfileScreen";
import ProfessionalHome from "@/screens/Professional/Home";
import { AvatarMenu } from "@/components/ui/AvatarMenu";
import EditProfileScreen from "@/screens/Professional/EditProfile";
import EditDoctorScheduler from "@/screens/Professional/EditDoctorScheduler";
import AllPatientsScreen from "@/screens/Professional/AllPatientsScreen";
import AppointmentDetailScreen from "@/screens/Common/AppointmentDetailScreen";
import PatientHistoryScreen from "@/screens/Professional/PatientHistoryScreen";
import { Appointment } from "@/types/appointment";

export type ProfessionalStackParamList = {
  Home: undefined;
  Appointments: undefined;
  Profile: undefined;
  ConfigProfile: undefined;
  EditDoctorScheduler: undefined;
  AllPatients: undefined;
  AppointmentDetail: { appointment: Appointment };
  PatientHistory: { patientId: number; patientName: string };
};

const Stack = createNativeStackNavigator<ProfessionalStackParamList>();

type Props = { initialScreen: keyof ProfessionalStackParamList };

const ProfessionalStack: React.FC<Props> = ({ initialScreen }) => (
  <Stack.Navigator initialRouteName={initialScreen}>
    <Stack.Screen
      name="Home"
      component={ProfessionalHome}
      options={{
        title: "Área do Profissional",
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
      component={EditDoctorScheduler}
      options={{ title: "Minhas Configurações" }}
    />

    <Stack.Screen
      name="EditDoctorScheduler"
      component={EditDoctorScheduler}
      options={{ title: "Perfil do Profissional" }}
    />

    <Stack.Screen
      name="AllPatients"
      component={AllPatientsScreen}
      options={{
        title: "",
        headerRight: () => <AvatarMenu />,
      }}
    />
    <Stack.Screen
      name="AppointmentDetail"
      component={AppointmentDetailScreen}
      options={{
        title: "Detalhes do Agendamento",
        headerRight: () => <AvatarMenu />,
      }}
    />
    <Stack.Screen
      name="PatientHistory"
      component={PatientHistoryScreen}
      options={{
        title: "Histórico do Paciente",
        headerRight: () => <AvatarMenu />,
      }}
    />
  </Stack.Navigator>
);

export default ProfessionalStack;
