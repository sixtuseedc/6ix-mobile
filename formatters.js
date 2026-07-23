// src/navigation/MainTabs.js
import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppTheme } from "../context/AppContext";

import DashboardScreen from "../screens/DashboardScreen";
import NumberSelectionScreen from "../screens/NumberSelectionScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ChatCallScreen from "../screens/ChatCallScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();
const DashboardStackNav = createNativeStackNavigator();
const MessagesStackNav = createNativeStackNavigator();

// Simple emoji-based icons keep the app dependency-light and avoid a heavy
// icon font mismatch across platforms; swap for react-native-vector-icons
// SF Symbols/Material icons any time.
function TabIcon({ symbol, focused, color }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5, color }}>
      {symbol}
    </Text>
  );
}

function DashboardStack() {
  return (
    <DashboardStackNav.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStackNav.Screen name="DashboardHome" component={DashboardScreen} />
      <DashboardStackNav.Screen name="NumberSelection" component={NumberSelectionScreen} />
    </DashboardStackNav.Navigator>
  );
}

function MessagesStack() {
  return (
    <MessagesStackNav.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStackNav.Screen name="MessagesHome" component={MessagesScreen} />
      <MessagesStackNav.Screen name="ChatCall" component={ChatCallScreen} />
    </MessagesStackNav.Navigator>
  );
}

export default function MainTabs() {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon symbol="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon symbol="💬" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon symbol="⚙️" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
