import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import ProfileStack from "./ProfileStack";

export type TabParamList = {
  HomeTab: undefined;
  AppointmentsTab: undefined;
  ConversationsTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

type FAIconName = React.ComponentProps<typeof FontAwesome>["name"];

const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,

      tabBarIcon: ({ color, size }) => {
        const icons: Record<keyof TabParamList, FAIconName> = {
          HomeTab: "home",
          AppointmentsTab: "calendar",
          ConversationsTab: "comments",
        };
        return (
          <FontAwesome name={icons[route.name]} size={size} color={color} />
        );
      },
    })}
  >
    <Tab.Screen name="HomeTab" options={{ title: "Início" }}>
      {() => <ProfileStack initialScreen="Home" />}
    </Tab.Screen>
    <Tab.Screen name="AppointmentsTab" options={{ title: "Agenda" }}>
      {() => <ProfileStack initialScreen="Appointments" />}
    </Tab.Screen>
    <Tab.Screen name="ConversationsTab" options={{ title: "Conversas" }}>
      {() => <ProfileStack initialScreen="Conversations" />}
    </Tab.Screen>
  </Tab.Navigator>
);

export default TabNavigator;
