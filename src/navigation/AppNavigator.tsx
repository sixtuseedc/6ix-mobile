import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import DialerScreen from "../screens/DialerScreen";
import MessagesScreen from "../screens/MessagesScreen";
import { useAppTheme } from "../context/AppContext";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { colors } = useAppTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border || "#333" },
          tabBarActiveTintColor: colors.primary || "#22c55e",
        }}
      >
        <Tab.Screen name="Dialer" component={DialerScreen} />
        <Tab.Screen name="Messages" component={MessagesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
